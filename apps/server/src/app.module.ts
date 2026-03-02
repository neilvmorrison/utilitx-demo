import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DrizzleModule } from './drizzle';

@Module({
  imports: [
    HealthModule,
    DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! }),
  ],
})
export class AppModule {}
