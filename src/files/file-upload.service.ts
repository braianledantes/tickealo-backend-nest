import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'images');
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Crear la carpeta uploads/images si no existe
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }

    this.apiUrl = this.configService.getOrThrow<string>('API_URL');
  }

  /**
   * Guarda un archivo de imagen en el servidor
   * @param file - El archivo a guardar
   * @param folder - Carpeta dentro de uploads/images donde guardar el archivo
   * @returns La URL del archivo guardado
   */
  saveImage(
    file: {
      originalname: string;
      buffer: Buffer;
    },
    folder = '',
  ): string {
    if (!file || !file.originalname || !file.buffer) {
      throw new Error('Archivo inválido');
    }

    const folderPath = folder ? join(this.uploadPath, folder) : this.uploadPath;

    // Crear la carpeta específica si no existe
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    // Generar un nombre único para el archivo
    const fileName = `${uuidv4()}${extname(file.originalname)}`;
    const filePath = join(folderPath, fileName);

    // Guardar el archivo
    writeFileSync(filePath, file.buffer);

    // Crea la URL relativa
    const relativePath = folder
      ? `/uploads/images/${folder}/${fileName}`
      : `/uploads/images/${fileName}`;

    // Retorna la URL completa
    return `${this.apiUrl}${relativePath}`;
  }

  /**
   * Elimina un archivo del servidor
   * @param filePath - La ruta del archivo a eliminar
   */
  deleteFile(filePath: string): void {
    const fullPath = join(process.cwd(), filePath);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }
}
