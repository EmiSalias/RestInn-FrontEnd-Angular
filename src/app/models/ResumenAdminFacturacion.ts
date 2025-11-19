export default interface ResumenAdminFacturacion {
  totalFacturado: number;
  totalPagado: number;
  totalPendiente: number;
  facturasPendientes: number;
  facturasPagadas: number;
  porcentajeCobro: number;
}
