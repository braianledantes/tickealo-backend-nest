import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(process.cwd(), 'temp');

  constructor(private readonly configService: ConfigService) {
    // Crear la carpeta uploads/images si no existe
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }

    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async saveImage(file: Express.Multer.File) {
    const filePath = this.saveImageTemp(file);
    const r = await cloudinary.uploader.upload(filePath, {
      folder: 'tickealo',
    });
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    return r.secure_url;
  }

  /**
   * Guarda un archivo de imagen en el servidor
   * @param file - El archivo a guardar
   * @param folder - Carpeta dentro de uploads/images donde guardar el archivo
   * @returns La paht del archivo guardado
   */
  private saveImageTemp(file: {
    originalname: string;
    buffer: Buffer;
  }): string {
    if (!file || !file.originalname || !file.buffer) {
      throw new Error('Archivo inválido');
    }

    const folderPath = this.uploadPath;

    // Crear la carpeta específica si no existe
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    // Generar un nombre único para el archivo
    const fileName = `${uuidv4()}${extname(file.originalname)}`;
    const filePath = join(folderPath, fileName);

    // Guardar el archivo
    writeFileSync(filePath, file.buffer);

    return filePath;
  }
}
