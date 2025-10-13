import {
  Injectable,
  PipeTransform,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';

/**
 * Pipe personalizado para validación de archivos de imagen.
 * Valida que el archivo sea una imagen (jpg, jpeg, png, gif).
 * El archivo es opcional (fileIsRequired: false).
 */
@Injectable()
export class ImageFileValidationPipe implements PipeTransform {
  private readonly parseFilePipe = new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|gif)$/i,
    })
    .build({
      fileIsRequired: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });

  async transform(value: any): Promise<any> {
    if (!value) {
      return value; // Si no hay archivo, lo devolvemos tal como está
    }
    return await this.parseFilePipe.transform(value);
  }
}
