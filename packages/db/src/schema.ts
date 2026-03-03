import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// PostGIS EWKB-Z parser
// Parses a raw hex EWKB string returned by PostGIS into { lng, lat, z }.
// Handles little-endian (NDR) and big-endian (XDR) byte orders.
// ---------------------------------------------------------------------------
function parseEWKBZ(hex: string): { lng: number; lat: number; z: number } {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const view = new DataView(bytes.buffer);
  const littleEndian = bytes[0] === 1;

  const geomType = view.getUint32(1, littleEndian);
  const hasSrid = (geomType & 0x20000000) !== 0;
  const coordOffset = hasSrid ? 9 : 5; // skip byte-order(1) + type(4) [+ srid(4)]

  return {
    lng: view.getFloat64(coordOffset, littleEndian),
    lat: view.getFloat64(coordOffset + 8, littleEndian),
    z: view.getFloat64(coordOffset + 16, littleEndian),
  };
}

// ---------------------------------------------------------------------------
// Custom PostGIS geometry types
// ---------------------------------------------------------------------------

export type PointZ = { lng: number; lat: number; z: number };

// geometry(PointZ, 4326) — for individual node positions with elevation
const geometryPointZ = customType<{ data: PointZ; driverData: string }>({
  dataType() {
    return 'geometry(PointZ, 4326)';
  },
  toDriver(value: PointZ): string {
    return `SRID=4326;POINTZ(${value.lng} ${value.lat} ${value.z})`;
  },
  fromDriver(value: string): PointZ {
    return parseEWKBZ(value);
  },
});

// geometry(GeometryZ, 4326) — cached LINESTRINGZ or POLYGONZ for a full path
// The application layer builds the EWKT from ordered nodes and stores it here.
// Queries should use ST_AsEWKT(cached_geometry) to read back human-readable WKT.
const geometryPath = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geometry(GeometryZ, 4326)';
  },
  toDriver(value: string): string {
    return value; // caller must pass full EWKT e.g. "SRID=4326;LINESTRINGZ(...)"
  },
  fromDriver(value: string): string {
    return value; // raw EWKB hex; use ST_AsEWKT() in SQL for readable form
  },
});

// ---------------------------------------------------------------------------
// Shared timestamp columns
// ---------------------------------------------------------------------------
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...timestamps,
});

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    middleName: text('middle_name'),
    avatarUrl: text('avatar_url'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    ...timestamps,
  },
  (table) => [
    index('user_profiles_organization_id_idx').on(table.organizationId),
  ],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => userProfiles.id),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    ...timestamps,
  },
  (table) => [
    index('projects_owner_id_idx').on(table.ownerId),
    index('projects_organization_id_idx').on(table.organizationId),
  ],
);

// Corresponds to the localStorage Layer type: { id, name, isVisible }
export const layers = pgTable(
  'layers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    isVisible: boolean('is_visible').notNull().default(true),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    ...timestamps,
  },
  (table) => [
    index('layers_project_id_idx').on(table.projectId),
  ],
);

// Corresponds to the localStorage DrawnPath type: { id, name, nodes[], color, width, isClosed, layerId, isHidden }
// cachedGeometry is a PostGIS LINESTRINGZ or POLYGONZ built from the ordered path_nodes.
// It is null until nodes exist and should be regenerated whenever nodes change.
export const paths = pgTable(
  'paths',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    color: varchar('color', { length: 7 }).notNull().default('#000000'),
    width: integer('width').notNull().default(2),
    isClosed: boolean('is_closed').notNull().default(false),
    isHidden: boolean('is_hidden').notNull().default(false),
    layerId: uuid('layer_id')
      .notNull()
      .references(() => layers.id),
    // Cached geometry for spatial queries. Null until at least one node exists.
    // isClosed=false → LINESTRINGZ; isClosed=true → POLYGONZ (first node repeated as last).
    cachedGeometry: geometryPath('cached_geometry'),
    ...timestamps,
  },
  (table) => [
    index('paths_layer_id_idx').on(table.layerId),
    index('paths_cached_geometry_gist_idx').using('gist', table.cachedGeometry),
  ],
);

// Corresponds to the localStorage Node type: { id, name, coords: [lng, lat], z }
// position is 0-based and determines the order of nodes within the path.
// z elevation is stored inside the geometry(PointZ) — use ST_Z(point) in queries.
export const pathNodes = pgTable(
  'path_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    pathId: uuid('path_id')
      .notNull()
      .references(() => paths.id),
    // geometry(PointZ, 4326): stores [longitude, latitude, elevation_meters]
    point: geometryPointZ('point').notNull(),
    ...timestamps,
  },
  (table) => [
    index('path_nodes_path_id_idx').on(table.pathId),
    index('path_nodes_point_gist_idx').using('gist', table.point),
    uniqueIndex('path_nodes_path_id_position_udx').on(table.pathId, table.position),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const organizationsRelations = relations(organizations, ({ many }) => ({
  userProfiles: many(userProfiles),
  projects: many(projects),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [userProfiles.organizationId],
    references: [organizations.id],
  }),
  ownedProjects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(userProfiles, {
    fields: [projects.ownerId],
    references: [userProfiles.id],
  }),
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  layers: many(layers),
}));

export const layersRelations = relations(layers, ({ one, many }) => ({
  project: one(projects, {
    fields: [layers.projectId],
    references: [projects.id],
  }),
  paths: many(paths),
}));

export const pathsRelations = relations(paths, ({ one, many }) => ({
  layer: one(layers, {
    fields: [paths.layerId],
    references: [layers.id],
  }),
  nodes: many(pathNodes),
}));

export const pathNodesRelations = relations(pathNodes, ({ one }) => ({
  path: one(paths, {
    fields: [pathNodes.pathId],
    references: [paths.id],
  }),
}));
