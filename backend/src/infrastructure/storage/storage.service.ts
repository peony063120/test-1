import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(file: any, path: string): Promise<string> {
    return `/${path}`;
  }

  async delete(path: string): Promise<void> {
    return;
  }

  async getSignedUrl(path: string): Promise<string> {
    return `https://example.com/${path}`;
  }
}
