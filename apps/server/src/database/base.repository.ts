import { Inject, NotFoundException } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { DRIZZLE, type DrizzleDB } from '../drizzle';

/** Any pg table that has id and deletedAt columns (soft-delete pattern). */
type TableWithSoftDelete = PgTableWithColumns<any>;

export abstract class BaseRepository<
  TTable extends TableWithSoftDelete,
  TSelect,
  TCreate,
  TUpdate extends object,
> {
  constructor(
    @Inject(DRIZZLE) protected readonly db: DrizzleDB,
    protected readonly table: TTable,
    protected readonly entityName: string,
  ) {}

  async findOne(id: string): Promise<TSelect> {
    const t = this.table as any;
    const [row] = await this.db
      .select()
      .from(t)
      .where(and(eq(t.id, id), isNull(t.deletedAt)));
    if (!row) throw new NotFoundException(`${this.entityName} ${id} not found`);
    return row as TSelect;
  }

  async findAll(): Promise<TSelect[]> {
    const t = this.table as any;
    return this.db.select().from(t).where(isNull(t.deletedAt)) as Promise<TSelect[]>;
  }

  async create(data: TCreate): Promise<TSelect> {
    const [row] = await this.db.insert(this.table as any).values(data as any).returning();
    return row as TSelect;
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    const t = this.table as any;
    const [row] = await this.db
      .update(t)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(and(eq(t.id, id), isNull(t.deletedAt)))
      .returning();
    if (!row) throw new NotFoundException(`${this.entityName} ${id} not found`);
    return row as TSelect;
  }

  async remove(id: string): Promise<TSelect> {
    const t = this.table as any;
    const [row] = await this.db
      .update(t)
      .set({ deletedAt: new Date() } as any)
      .where(and(eq(t.id, id), isNull(t.deletedAt)))
      .returning();
    if (!row) throw new NotFoundException(`${this.entityName} ${id} not found`);
    return row as TSelect;
  }
}
