import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { config } from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: path.resolve(process.cwd(), '.env') });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error('Unable to connect to the database. Please ensure PostgreSQL is running.', error as Error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.warn('Prisma disconnect completed with warnings.', error as Error);
    }
  }
}
