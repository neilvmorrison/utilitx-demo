import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DrizzleModule } from './drizzle';
import { AuthModule } from './auth/auth.module';
import { ExampleModule } from './example/example.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    ExampleModule,
    DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! }),
  ],
})
export class AppModule {}
