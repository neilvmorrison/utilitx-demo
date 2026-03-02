import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { DrizzleModule } from "./drizzle";
import { OrganizationsModule } from "./organizations/organizations.module";
import { UserProfilesModule } from "./user-profiles/user-profiles.module";
import { ProjectsModule } from "./projects/projects.module";
import { LayersModule } from "./layers/layers.module";
import { PathsModule } from "./paths/paths.module";
import { PathNodesModule } from "./path-nodes/path-nodes.module";

@Module({
  imports: [
    DrizzleModule.forRoot({
      connectionString:
        "postgresql://utilitix:utilitix@localhost:5432/utilitix",
    }),
    HealthModule,
    OrganizationsModule,
    UserProfilesModule,
    ProjectsModule,
    LayersModule,
    PathsModule,
    PathNodesModule,
  ],
})
export class AppModule {}
