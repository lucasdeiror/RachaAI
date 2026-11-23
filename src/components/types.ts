export interface VagaDTO {
  id: number;
  participanteId: number | null;
  valorVaga: number | string;
  status: 'ABERTA' | 'OCUPADA';
}

export interface ItemDTO {
  id: number;
  mesaId: number;
  descricao: string;
  quantidade: number;
  valorTotal: number | string;
  tipo: 'INDIVIDUAL' | 'COMPARTILHADO';
  participanteId?: number | null;
  vagasTotais: number;
  vagas?: VagaDTO[];
}
