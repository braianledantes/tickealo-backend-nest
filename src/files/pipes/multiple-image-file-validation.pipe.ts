import {
  Injectable,
  PipeTransform,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';

/**
 * Pipe personalizado para validación de múltiples campos de archivos de imagen.
 * Valida archivos en un objeto con campos específicos (ej: { portada: File[], banner: File[] }).
 * Cada archivo debe ser una imagen (jpg, jpeg, png, gif) y tener un tamaño máximo de 1MB.
 * Los archivos son opcionales.
 */
@Injectable()
export class MultipleImageFileValidationPipe implements PipeTransform {
  private readonly parseFilePipe = new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|gif)$/i,
    })
    .addMaxSizeValidator({
      maxSize: 1024 * 1024, // 1MB
    })
    .build({
      fileIsRequired: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });

  async transform(value: {
    [fieldname: string]: Express.Multer.File[];
  }): Promise<{ [fieldname: string]: Express.Multer.File[] }> {
    if (!value || typeof value !== 'object') {
      return value;
    }

    // Validar cada campo que contiene archivos
    for (const fieldName in value) {
      const files = value[fieldName];
      if (Array.isArray(files)) {
        // Validar cada archivo en el array
        for (const file of files) {
          if (file) {
            await this.parseFilePipe.transform(file);
          }
        }
      }
    }

    return value;
  }
}
