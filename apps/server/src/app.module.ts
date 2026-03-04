import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DrizzleModule } from './drizzle';
import { OrganizationsModule } from './organizations/organizations.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { ProjectsModule } from './projects/projects.module';
import { LayersModule } from './layers/layers.module';
import { PathsModule } from './paths/paths.module';
import { PathNodesModule } from './path-nodes/path-nodes.module';
import { AuthModule } from './auth/auth.module';
import { ExampleModule } from './example/example.module';
import { S3Module } from './s3';
import { ProjectFilesModule } from './project-files/project-files.module';

@Module({
  imports: [
    HealthModule,
    OrganizationsModule,
    UserProfilesModule,
    ProjectsModule,
    LayersModule,
    PathsModule,
    PathNodesModule,
    AuthModule,
    ExampleModule,
    S3Module,
    ProjectFilesModule,
    DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! }),
  ],
})
export class AppModule {}
