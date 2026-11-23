import React from 'react';
import { CalculadoraComanda, ItemComandaInput } from './CalculadoraComanda';
import { ItemComanda } from './SelecaoConsumo';
import { ParticipanteRadar } from './RadarQuitacao';
import { Share2, Users, Check, ShieldCheck, DollarSign, ArrowRight, Trash2 } from 'lucide-react';

interface PainelHostProps {
  codigoHash: string;
  nomeHost: string;
  chavePixHost: string;
  taxaServico: number;
  itens: ItemComanda[];
  participantes: ParticipanteRadar[];
  onAddItem: (item: ItemComandaInput) => void;
  onRemoverItem: (itemId: number) => void;
  onConfirmarPagamento: (participanteId: number) => void;
  onMarcarPagoDinheiro: (participanteId: number) => void;
  onAbrirCompartilhar: () => void;
  onAlternarParaConvidado: () => void;
  onEncerrarMesa?: () => void;
}

export const PainelHost: React.FC<PainelHostProps> = ({
  codigoHash,
  nomeHost,
  chavePixHost,
  taxaServico,
  itens,
  participantes,
  onAddItem,
  onRemoverItem,
  onConfirmarPagamento,
  onMarcarPagoDinheiro,
  onAbrirCompartilhar,
  onAlternarParaConvidado,
  onEncerrarMesa,
}) => {
  // Cálculos financeiros do Anfitrião
  const totalItens = itens.reduce((acc, i) => acc + i.valorTotal, 0);
  const totalMesaComTaxa = totalItens + (totalItens * taxaServico) / 100;

  // Total já recebido (confirmado) dos convidados
  const convidados = participantes.filter((p) => p.nome !== nomeHost);
  const totalRecebido = convidados
    .filter((p) => p.statusQuitacao === 'CONFIRMADO')
    .reduce((acc, p) => acc + Number(p.valorFinal), 0);

  const saldoPendente = Math.max(0, totalMesaComTaxa - totalRecebido);
  const progressoPct = totalMesaComTaxa > 0
    ? Math.min(100, Math.round((totalRecebido / totalMesaComTaxa) * 100))
    : 0;

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-4">
      {/* Card do Anfitrião com Status & Compartilhamento */}
      <div className="bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider text-[#FACC15] font-bold bg-[#FACC15]/10 px-2 py-0.5 rounded-full">
                👑 Anfitrião
              </span>
              <span className="text-xs text-[#71717A] font-mono">#{codigoHash}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Conta de {nomeHost}</h1>
            <p className="text-xs text-[#A1A1AA]">
              Chave Pix: <span className="font-mono text-white">{chavePixHost}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onAbrirCompartilhar}
            className="px-3.5 py-2 bg-[#FACC15] hover:bg-[#EAB308] active:scale-95 text-[#0A0A0C] font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <Share2 size={14} /> Convidar
          </button>
        </div>

        {/* Três Métricas Financeiras Principais */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#23232A]">
          <div className="bg-[#101013] border border-[#23232A] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block">Conta Total</span>
            <span className="text-sm font-bold font-mono text-white">
              R$ {totalMesaComTaxa.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#101013] border border-[#23232A] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-[#34D399] uppercase tracking-wider block">Já Recebeu</span>
            <span className="text-sm font-bold font-mono text-[#34D399]">
              R$ {totalRecebido.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#101013] border border-[#23232A] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-[#FB923C] uppercase tracking-wider block">Falta Cair</span>
            <span className="text-sm font-bold font-mono text-[#FB923C]">
              R$ {saldoPendente.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Barra de Progresso de Quitação */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#A1A1AA]">
            <span>Progresso da Quitação</span>
            <span className="font-mono text-white font-semibold">{progressoPct}% coberto</span>
          </div>
          <div className="w-full h-2.5 bg-[#101013] rounded-full overflow-hidden border border-[#23232A]">
            <div
              className="h-full bg-gradient-to-r from-[#FACC15] to-[#34D399] transition-all duration-500"
              style={{ width: `${progressoPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lançamento Rápido de Itens (Opcional para o Host) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
            Lançar item na mesa
          </span>
          <span className="text-[11px] text-[#71717A]">
            (Convidados também podem lançar)
          </span>
        </div>
        <CalculadoraComanda onAddItem={onAddItem} />
      </div>

      {/* Radar de Pagamentos dos Convidados */}
      <div className="bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#34D399]" />
            <h2 className="text-sm font-bold text-white">
              Pagamentos dos Amigos ({convidados.length})
            </h2>
          </div>
          <span className="text-xs text-[#A1A1AA]">
            {convidados.filter((c) => c.statusQuitacao === 'CONFIRMADO').length} de {convidados.length} pagos
          </span>
        </div>

        {convidados.length === 0 ? (
          <div className="text-center py-6 text-[#71717A] space-y-2">
            <Users size={28} className="mx-auto text-[#3F3F46]" />
            <p className="text-xs">Nenhum convidado entrou na sala ainda.</p>
            <button
              type="button"
              onClick={onAbrirCompartilhar}
              className="text-xs text-[#FACC15] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Share2 size={12} /> Enviar link no WhatsApp da galera
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {convidados.map((p) => {
              const isConfirmado = p.statusQuitacao === 'CONFIRMADO';
              const isDeclarou = p.statusQuitacao === 'DECLAROU_PAGO';

              return (
                <div
                  key={p.id}
                  className={`bg-[#101013] border rounded-2xl p-3 flex items-center justify-between transition-colors ${
                    isConfirmado
                      ? 'border-[#34D399]/40 bg-[#34D399]/5'
                      : isDeclarou
                      ? 'border-[#FB923C]/50 bg-[#FB923C]/5'
                      : 'border-[#23232A]'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white text-sm block">{p.nome}</span>
                    <span className="font-mono text-xs text-[#A1A1AA]">
                      Cota: R$ {Number(p.valorFinal || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    {isConfirmado ? (
                      <span className="px-2.5 py-1 bg-[#34D399]/20 text-[#34D399] rounded-xl text-xs font-bold flex items-center gap-1">
                        <Check size={13} /> Confirmado
                      </span>
                    ) : isDeclarou ? (
                      <button
                        type="button"
                        onClick={() => onConfirmarPagamento(p.id)}
                        className="px-3 py-1.5 bg-[#34D399] hover:bg-[#10B981] active:scale-95 text-[#0A0A0C] text-xs font-bold rounded-xl flex items-center gap-1 shadow transition-transform"
                      >
                        <Check size={13} /> Confirmar Pix
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#71717A] px-2 py-1 bg-[#18181C] rounded-xl">
                          Consumindo
                        </span>
                        <button
                          type="button"
                          title="Marcar como pago em dinheiro"
                          onClick={() => onMarcarPagoDinheiro(p.id)}
                          className="px-2 py-1 bg-[#202026] hover:bg-[#2C2C35] text-[#A1A1AA] hover:text-white text-[11px] rounded-xl transition-colors"
                        >
                          Dinheiro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Itens Lançados na Comanda */}
      <div className="bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-xl space-y-3">
        <div className="flex justify-between items-center border-b border-[#23232A] pb-2.5">
          <h2 className="text-sm font-bold text-white">
            Itens da Comanda ({itens.length})
          </h2>
          <span className="text-xs font-mono text-[#FACC15] font-semibold">
            Total: R$ {totalItens.toFixed(2)}
          </span>
        </div>

        {itens.length === 0 ? (
          <p className="text-xs text-[#71717A] text-center py-4">
            Nenhum item lançado ainda. Use a barra acima ou deixe a galera lançar.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {itens.map((item) => (
              <div
                key={item.id}
                className="bg-[#101013] border border-[#23232A] rounded-xl px-3 py-2 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{item.descricao}</span>
                  {item.quantidade > 1 && (
                    <span className="text-[10px] text-[#FACC15] font-mono bg-[#FACC15]/10 px-1.5 py-0.5 rounded-md">
                      {item.quantidade}x
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#D4D4D8] font-bold">
                    R$ {item.valorTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoverItem(item.id)}
                    aria-label={`Remover ${item.descricao}`}
                    className="text-[#71717A] hover:text-[#F87171] p-1 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de Teste / Alternar para Visão de Convidado */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={onAlternarParaConvidado}
          className="w-full py-3 bg-[#1A1A20] hover:bg-[#22222B] text-xs font-semibold text-[#FACC15] rounded-2xl border border-[#FACC15]/20 flex items-center justify-center gap-1.5 transition-colors active:scale-98"
        >
          <Users size={14} />
          Entrar como Convidado (Simular Amigo na Mesa)
          <ArrowRight size={13} />
        </button>

        {onEncerrarMesa && (
          <button
            type="button"
            onClick={onEncerrarMesa}
            className="w-full py-2 text-xs text-[#71717A] hover:text-[#F87171] transition-colors text-center"
          >
            Encerrar esta mesa e abrir nova sala
          </button>
        )}
      </div>
    </div>
  );
};
