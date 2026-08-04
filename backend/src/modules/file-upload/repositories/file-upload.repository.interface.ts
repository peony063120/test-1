export const FILE_UPLOAD_REPOSITORY = Symbol('FILE_UPLOAD_REPOSITORY');

export interface IFileUploadRepository {
  save(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findAll(query?: any): Promise<any>;
  delete(id: string): Promise<void>;
}
