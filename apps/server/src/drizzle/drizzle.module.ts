import { Global, Module, DynamicModule } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DRIZZLE = Symbol('DRIZZLE');
export type DrizzleDB = NodePgDatabase;

export interface DrizzleModuleOptions {
  connectionString: string;
}

@Global()
@Module({})
export class DrizzleModule {
  static forRoot(options: DrizzleModuleOptions): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DRIZZLE,
          useFactory: () => drizzle(options.connectionString),
        },
      ],
      exports: [DRIZZLE],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => DrizzleModuleOptions | Promise<DrizzleModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DRIZZLE,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return drizzle(config.connectionString);
          },
          inject: options.inject ?? [],
        },
      ],
      exports: [DRIZZLE],
    };
  }
}
