export enum EstadoCompra {
  /**
   * La compra ha sido iniciada pero no se ha recibido el comprobante de pago.
   */
  INICIADA = 'INICIADA',
  /**
   * Se ha recibido el comprobante de pago y la compra está pendiente de revisión.
   */
  PENDIENTE = 'PENDIENTE',
  /**
   * La compra ha sido aceptada tras la revisión del comprobante de pago.
   */
  ACEPTADA = 'ACEPTADA',
  /**
   * La compra ha sido rechazada tras la revisión del comprobante de pago.
   */
  RECHAZADA = 'RECHAZADA',
}
