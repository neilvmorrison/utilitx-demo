import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude PostGIS system tables from schema management.
  // Without this, drizzle-kit tries to drop spatial_ref_sys and other
  // PostGIS-managed tables that it doesn't own.
  tablesFilter: ['!spatial_ref_sys', '!geography_columns', '!geometry_columns'],
});
