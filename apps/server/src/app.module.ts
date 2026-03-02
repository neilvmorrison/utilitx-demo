import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
// TODO: uncomment once DATABASE_URL is configured in .env.local
// import { DrizzleModule } from './drizzle';

@Module({
  imports: [
    HealthModule,
    // DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! }),
  ],
})
export class AppModule {}
