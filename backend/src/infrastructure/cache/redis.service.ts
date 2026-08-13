import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis-backed cache service with graceful in-memory fallback.
 *
 * - Uses real Redis when available (configured via REDIS_HOST / REDIS_PORT).
 * - Falls back to an in-memory Map when Redis is unreachable, so the app
 *   keeps working in local/dev environments and during Redis outages.
 * - Keeps the same public interface (get / set / del) so no caller changes.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private client: Redis | null = null;
  private redisReady = false;

  private readonly fallback = new Map<string, { value: any; expiresAt: number }>();

  constructor(configService: ConfigService) {
    const host = configService.get<string>('REDIS_HOST') || 'localhost';
    const port = Number(configService.get<string>('REDIS_PORT') || 6379);
    const url = configService.get<string>('REDIS_URL');

    try {
      this.client = url
        ? new Redis(url, {
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            enableOfflineQueue: false,
            retryStrategy: (times: number) => {
              // Stop retrying after 3 attempts and fall back to memory
              if (times > 3) return null;
              return Math.min(times * 200, 1000);
            },
          })
        : new Redis({
            host,
            port,
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            enableOfflineQueue: false,
            retryStrategy: (times: number) => {
              // Stop retrying after 3 attempts and fall back to memory
              if (times > 3) return null;
              return Math.min(times * 200, 1000);
            },
          });

      this.client.on('ready', () => {
        this.redisReady = true;
        this.logger.log(`Redis connected at ${host}:${port}`, 'RedisService');
      });

      this.client.on('error', () => {
        this.redisReady = false;
      });

      this.client.on('close', () => {
        if (this.redisReady) {
          this.redisReady = false;
          this.logger.warn('Redis connection closed, using in-memory cache', 'RedisService');
        }
      });

      this.client.on('end', () => {
        this.redisReady = false;
      });
    } catch (error) {
      this.logger.warn(`Failed to initialize Redis client, using in-memory cache: ${(error as Error).message}`, 'RedisService');
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
    }
  }

  private async keysByPattern(pattern: string): Promise<string[]> {
    if (!this.client || !this.redisReady) {
      // In-memory wildcard matching
      const prefix = pattern.replace('*', '');
      return Array.from(this.fallback.keys()).filter((key) => key.startsWith(prefix));
    }

    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, found] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...found);
    } while (cursor !== '0');

    return keys;
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client && this.redisReady) {
      try {
        const raw = await this.client.get(key);
        if (raw === null) return null;
        return JSON.parse(raw) as T;
      } catch (error) {
        this.logger.warn(`Redis get failed for "${key}": ${(error as Error).message}`, 'RedisService');
      }
    }

    const entry = this.fallback.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.fallback.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.client && this.redisReady) {
      try {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (error) {
        this.logger.warn(`Redis set failed for "${key}": ${(error as Error).message}`, 'RedisService');
      }
    }

    this.fallback.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    const keys = key.includes('*') ? await this.keysByPattern(key) : [key];
    if (!keys.length) return;

    if (this.client && this.redisReady) {
      try {
        await this.client.del(...keys);
      } catch (error) {
        this.logger.warn(`Redis del failed for "${key}": ${(error as Error).message}`, 'RedisService');
      }
    }

    keys.forEach((k) => this.fallback.delete(k));
  }
}
