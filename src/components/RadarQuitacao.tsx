import React from 'react';
import { Check, Lock, ShieldCheck } from 'lucide-react';

export interface ParticipanteRadar {
  id: number;
  nome: string;
  statusQuitacao: 'CONSUMINDO' | 'DECLAROU_PAGO' | 'CONFIRMADO';
  valorFinal: number;
}

interface RadarQuitacaoProps {
  participantes: ParticipanteRadar[];
  totalMesa: number;
  isHost?: boolean;
  statusMesa?: 'ABERTA' | 'TRAVADA' | 'FINALIZADA';
  onConfirmarPagamento?: (participanteId: number) => void;
  onTravarMesa?: () => void;
}

export const RadarQuitacao: React.FC<RadarQuitacaoProps> = ({
  participantes,
  totalMesa,
  isHost,
  statusMesa = 'ABERTA',
  onConfirmarPagamento,
  onTravarMesa,
}) => {
  const totalConfirmado = participantes
    .filter((p) => p.statusQuitacao === 'CONFIRMADO')
    .reduce((acc, p) => acc + Number(p.valorFinal), 0);

  const pctConfirmado = totalMesa > 0 ? Math.min(100, Math.round((totalConfirmado / totalMesa) * 100)) : 0;
  const isTravada = statusMesa === 'TRAVADA' || statusMesa === 'FINALIZADA';

  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <ShieldCheck size={18} className="text-[#34D399]" />
            Radar de Quitação Social
          </h2>
          <p className="text-xs text-[#A1A1AA]">Acompanhe quem pagou a conta do bar</p>
        </div>

        {isHost && !isTravada && onTravarMesa && (
          <button
            type="button"
            onClick={onTravarMesa}
            className="px-3 py-1.5 bg-[#202026] hover:bg-[#2C2C35] text-[#FB923C] border border-[#FB923C]/30 rounded-xl text-xs font-semibold flex items-center gap-1"
          >
            <Lock size={12} /> Travar Mesa
          </button>
        )}
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-[#A1A1AA]">Progresso da Conta</span>
          <span className="font-mono text-[#34D399] font-bold">{pctConfirmado}% Pago</span>
        </div>
        <div className="w-full h-3 bg-[#101013] rounded-full overflow-hidden border border-[#23232A]">
          <div
            className="h-full bg-gradient-to-r from-[#FACC15] to-[#34D399] transition-all duration-500"
            style={{ width: `${pctConfirmado}%` }}
          />
        </div>
      </div>

      {/* Lista de Participantes */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {participantes.map((p) => {
          return (
            <div
              key={p.id}
              className="bg-[#101013] border border-[#23232A] rounded-2xl p-3 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white text-sm block">{p.nome}</span>
                <span className="font-mono text-[#A1A1AA]">R$ {Number(p.valorFinal).toFixed(2)}</span>
              </div>

              <div>
                {p.statusQuitacao === 'CONFIRMADO' ? (
                  <span className="px-2.5 py-1 bg-[#34D399]/20 text-[#34D399] rounded-xl font-bold flex items-center gap-1">
                    <Check size={12} /> Confirmado
                  </span>
                ) : p.statusQuitacao === 'DECLAROU_PAGO' ? (
                  isHost && onConfirmarPagamento ? (
                    <button
                      type="button"
                      onClick={() => onConfirmarPagamento(p.id)}
                      className="px-3 py-1.5 bg-[#34D399] hover:bg-[#10B981] text-[#0A0A0C] rounded-xl font-bold transition-transform active:scale-95"
                    >
                      Confirmar 1-Toque
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-[#FB923C]/20 text-[#FB923C] rounded-xl font-medium">
                      Declarou Pago
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 bg-[#202026] text-[#71717A] rounded-xl">
                    Consumindo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
