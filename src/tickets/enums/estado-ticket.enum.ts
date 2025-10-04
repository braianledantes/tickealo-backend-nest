export enum EstadoTicket {
  /**
   * El ticket ha sido comprado pero aún no ha confirmado la compra.
   * El cliente debe subir el comprobante de transferencia para que la compra
   * pueda ser validada por el sistema.
   */
  COMPRA_PENDIENTE = 'COMPRA_PENDIENTE',
  /**
   * El ticket ha sido cancelado por la productora.
   */
  COMPRA_CANCELADO = 'COMPRA_CANCELADO',
  /**
   * El ticket ha sido comprado y el cliente ha subido el comprobante de transferencia.
   * Puede ser validado por un validator.
   */
  PENDIENTE_VALIDACION = 'PENDIENTE_VALIDACION',
  /**
   * El ticket ha sido validado por un validator.
   */
  VALIDADO = 'VALIDADO',
}
