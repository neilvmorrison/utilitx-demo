import { Injectable } from '@nestjs/common';
import { OrganizationsRepository } from '../database/organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly repo: OrganizationsRepository) {}

  async findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreateOrganizationDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }

  /** Returns the first active org, or creates a default one. Used for auto-provisioning new users. */
  async findFirstOrCreateDefault() {
    return this.repo.findFirstOrCreateDefault();
  }
}
