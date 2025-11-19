export type SortField =
  | 'id'
  | 'fechaEmision'
  | 'clienteNombre'
  | 'reservaId'
  | 'habitacionNumero'
  | 'tipoFactura'
  | 'estado'
  | 'totalFinal';

export interface SortState {
  field: SortField;
  dir: 'asc' | 'desc';
}