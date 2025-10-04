/**
 * Genera el siguiente código alfanumérico en secuencia.
 * Ejemplo: '000 001' -> '000 002', '000 009' -> '000 00A', '000 00Z' -> '000 010', 'ZZZ ZZZ' -> Error (límite alcanzado)
 * @param codigoPrevio Código alfanumérico previo de 7 caracteres (formato 'XXX XXX')
 * @returns Siguiente código alfanumérico en secuencia
 * @throws Error si se alcanza el límite máximo ('ZZZ ZZZ')
 */
export const generarSiguienteCodigoAlfanumerico = (
  codigoPrevio?: string,
): string => {
  if (!codigoPrevio || codigoPrevio === '') {
    return '000 000';
  }

  const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Validar que el código tenga exactamente 7 caracteres (incluyendo el espacio)
  if (codigoPrevio.length !== 7) {
    throw new Error(
      'El código debe tener exactamente 7 caracteres (incluyendo espacios).',
    );
  }

  // Validar que el espacio esté en la posición correcta
  if (codigoPrevio.charAt(3) !== ' ') {
    throw new Error(
      'El código debe tener exactamente 7 caracteres (incluyendo espacios).',
    );
  }

  // Remover espacios para facilitar el procesamiento
  const codigoSinEspacios = codigoPrevio.replace(/ /g, '');
  const longitud = 6; // 6 caracteres sin espacios

  const codigoArray = codigoSinEspacios.split('');
  let carry = 1; // Inicialmente tenemos un "acarreo" para incrementar

  for (let i = longitud - 1; i >= 0 && carry > 0; i--) {
    const index = caracteres.indexOf(codigoArray[i]);
    if (index === -1) {
      throw new Error('El código contiene caracteres inválidos.');
    }

    let nuevoIndex = index + carry;
    if (nuevoIndex >= caracteres.length) {
      nuevoIndex = 0; // Reiniciar a '0' si excede el límite
      carry = 1; // Mantener el acarreo
    } else {
      carry = 0; // No hay más acarreo
    }
    codigoArray[i] = caracteres[nuevoIndex];
  }

  if (carry > 0) {
    throw new Error(
      'Se ha alcanzado el límite máximo de códigos alfanuméricos.',
    );
  }

  // Reinsertar espacios en la posición correcta (después del tercer carácter)
  codigoArray.splice(3, 0, ' ');

  return codigoArray.join('');
};
