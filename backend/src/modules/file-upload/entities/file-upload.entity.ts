export class FileUploadEntity {
  id: string = '';
  fileName: string = '';
  url: string = '';
  type: string = '';
  size: number = 0;
  createdBy?: string;
  createdAt: Date = new Date();
}
