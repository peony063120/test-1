export interface StorageProvider {
  upload(file: any, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string): Promise<string>;
}
