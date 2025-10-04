import { generarSiguienteCodigoAlfanumerico } from './codigos';

describe('generarSiguienteCodigoAlfanumerico', () => {
  describe('casos básicos', () => {
    it('debe retornar "000 000" cuando no se proporciona código previo', () => {
      expect(generarSiguienteCodigoAlfanumerico()).toBe('000 000');
    });

    it('debe retornar "000 000" cuando se proporciona undefined', () => {
      expect(generarSiguienteCodigoAlfanumerico(undefined)).toBe('000 000');
    });

    it('debe retornar "000 000" cuando se proporciona string vacío', () => {
      expect(generarSiguienteCodigoAlfanumerico('')).toBe('000 000');
    });
  });

  describe('incremento numérico', () => {
    it('debe incrementar dígitos simples', () => {
      expect(generarSiguienteCodigoAlfanumerico('000 000')).toBe('000 001');
      expect(generarSiguienteCodigoAlfanumerico('000 001')).toBe('000 002');
      expect(generarSiguienteCodigoAlfanumerico('000 008')).toBe('000 009');
    });

    it('debe manejar el cambio de 9 a A', () => {
      expect(generarSiguienteCodigoAlfanumerico('000 009')).toBe('000 00A');
      expect(generarSiguienteCodigoAlfanumerico('000 00A')).toBe('000 00B');
      expect(generarSiguienteCodigoAlfanumerico('000 00Z')).toBe('000 010');
    });

    it('debe manejar acarreo en múltiples posiciones', () => {
      expect(generarSiguienteCodigoAlfanumerico('000 0ZZ')).toBe('000 100');
      expect(generarSiguienteCodigoAlfanumerico('000 ZZZ')).toBe('001 000');
      expect(generarSiguienteCodigoAlfanumerico('00Z ZZZ')).toBe('010 000');
    });
  });

  describe('incremento alfanumérico completo', () => {
    it('debe incrementar letras', () => {
      expect(generarSiguienteCodigoAlfanumerico('000 00A')).toBe('000 00B');
      expect(generarSiguienteCodigoAlfanumerico('000 00Y')).toBe('000 00Z');
    });

    it('debe manejar secuencias mixtas', () => {
      expect(generarSiguienteCodigoAlfanumerico('123 ABC')).toBe('123 ABD');
      expect(generarSiguienteCodigoAlfanumerico('A1B 2C3')).toBe('A1B 2C4');
    });
  });

  describe('casos límite', () => {
    it('debe lanzar error al alcanzar el límite máximo', () => {
      expect(() => generarSiguienteCodigoAlfanumerico('ZZZ ZZZ')).toThrow(
        'Se ha alcanzado el límite máximo de códigos alfanuméricos.',
      );
    });
  });

  describe('validación de entrada', () => {
    it('debe lanzar error para códigos con longitud incorrecta', () => {
      expect(() => generarSiguienteCodigoAlfanumerico('12345')).toThrow(
        'El código debe tener exactamente 7 caracteres (incluyendo espacios).',
      );
      expect(() => generarSiguienteCodigoAlfanumerico('123 456 789')).toThrow(
        'El código debe tener exactamente 7 caracteres (incluyendo espacios).',
      );
    });

    it('debe lanzar error para caracteres inválidos', () => {
      expect(() => generarSiguienteCodigoAlfanumerico('12A 45@')).toThrow(
        'El código contiene caracteres inválidos.',
      );
      expect(() => generarSiguienteCodigoAlfanumerico('ABC Def')).toThrow(
        'El código contiene caracteres inválidos.',
      );
    });

    it('debe manejar códigos sin espacios correctamente', () => {
      // Este test verificará si la función maneja códigos sin el espacio
      expect(() => generarSiguienteCodigoAlfanumerico('0000000')).toThrow(
        'El código debe tener exactamente 7 caracteres (incluyendo espacios).',
      );
    });
  });

  describe('formato de salida', () => {
    it('debe mantener el formato con espacio en la posición correcta', () => {
      const resultado = generarSiguienteCodigoAlfanumerico('000 000');
      expect(resultado).toMatch(/^\w{3} \w{3}$/);
      expect(resultado.charAt(3)).toBe(' ');
    });

    it('debe preservar ceros a la izquierda', () => {
      expect(generarSiguienteCodigoAlfanumerico('000 000')).toBe('000 001');
      expect(generarSiguienteCodigoAlfanumerico('000 999')).toBe('000 99A');
    });
  });
});
