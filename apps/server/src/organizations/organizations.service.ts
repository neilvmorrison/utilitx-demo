import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { organizations } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll() {
    return this.db
      .select()
      .from(organizations)
      .where(isNull(organizations.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    if (!row) throw new NotFoundException(`Organization ${id} not found`);
    return row;
  }

  async create(dto: CreateOrganizationDto) {
    const [row] = await this.db
      .insert(organizations)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const [row] = await this.db
      .update(organizations)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Organization ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(organizations)
      .set({ deletedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Organization ${id} not found`);
    return row;
  }
}
