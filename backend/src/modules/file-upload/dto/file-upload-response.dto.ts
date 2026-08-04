export class FileUploadResponseDto {
  id: string = '';
  fileName: string = '';
  url: string = '';
  type: string = '';
  size: number = 0;
  createdAt: Date = new Date();
}
