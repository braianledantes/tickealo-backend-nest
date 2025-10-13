export enum EstadoTicket {
  /**
   * El ticket ha sido creado y la compra está en proceso.
   */
  INICIADO = 'INICIADO',
  /**
   * La compra está pendiente de revisión.
   */
  COMPRA_PENDIENTE = 'COMPRA_PENDIENTE',
  /**
   * La compra ha sido aceptada y el ticket está pendiente de validación.
   */
  PENDIENTE_VALIDACION = 'PENDIENTE_VALIDACION',
  /**
   * El ticket ha sido validado y es válido para el evento.
   */
  VALIDADO = 'VALIDADO',
  /**
   * El ticket ha sido rechazado o la compra cancelada.
   */
  RECHAZADO = 'RECHAZADO',
}
