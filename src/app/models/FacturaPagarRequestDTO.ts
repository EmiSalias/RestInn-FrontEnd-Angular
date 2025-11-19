export default interface FacturaPagarRequestDTO {
  metodoPago: 'EFECTIVO' | 'CREDITO';
  cuotas: number;
}