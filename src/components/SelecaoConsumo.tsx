import React from 'react';

export interface ItemComanda {
  id: number;
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

// Mapa do participante: itemId -> divisao (1 = integral, 2 = metade, 3 = um terço, 0 = não consumiu)
export type ConsumoParticipanteMap = Record<number, number>;

interface SelecaoConsumoProps {
  itens: ItemComanda[];
  consumoMap: ConsumoParticipanteMap;
  taxaServico: number;
  onChangeDivisao: (itemId: number, divisao: number) => void;
  onAvancarParaPagamento: () => void;
}

export const SelecaoConsumo: React.FC<SelecaoConsumoProps> = ({
  itens,
  consumoMap,
  taxaServico,
  onChangeDivisao,
  onAvancarParaPagamento,
}) => {
  // Calcula subtotal do participante somando as cotas declaradas
  let subtotalConsumo = 0;

  itens.forEach((item) => {
    const divisor = consumoMap[item.id] || 0;
    if (divisor > 0) {
      subtotalConsumo += item.valorTotal / divisor;
    }
  });

  const valorTaxa = (subtotalConsumo * taxaServico) / 100;
  const totalPagar = subtotalConsumo + valorTaxa;

  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white flex flex-col justify-between min-h-[560px] shadow-2xl">
      <div className="space-y-4">
        <div className="border-b border-[#23232A] pb-3">
          <h2 className="text-lg font-bold">O que você consumiu?</h2>
          <p className="text-xs text-[#A1A1AA]">Toque no item. Se dividiu com amigos, escolha em quantas pessoas</p>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {itens.length === 0 ? (
            <div className="text-center py-12 text-[#71717A] space-y-1">
              <p className="text-sm font-semibold">Nenhum item na comanda ainda.</p>
              <p className="text-xs">Lance os itens acima para começar a divisão.</p>
            </div>
          ) : (
            itens.map((item) => {
              const divisorAtual = consumoMap[item.id] || 0;
              const valorCota = divisorAtual > 0 ? item.valorTotal / divisorAtual : 0;

              return (
                <div
                  key={item.id}
                  className={`bg-[#101013] border rounded-2xl p-3.5 space-y-2.5 transition-colors ${
                    divisorAtual > 0 ? 'border-[#FACC15]/40' : 'border-[#23232A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-white">{item.descricao}</span>
                      <span className="text-[11px] text-[#A1A1AA] block font-mono">
                        {item.quantidade > 1 ? `${item.quantidade}x ` : ''}Total R$ {item.valorTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm ${
                        divisorAtual > 0 ? 'text-[#FACC15]' : 'text-[#71717A]'
                      }`}>
                        {divisorAtual > 0 ? `R$ ${valorCota.toFixed(2)}` : 'R$ 0,00'}
                      </span>
                      {divisorAtual > 1 && (
                        <span className="block text-[10px] text-[#A1A1AA]">
                          dividido por {divisorAtual}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controle Aberto de Divisão por Inteiro (AD-019) */}
                  <div className="bg-[#151518] border border-[#23232A] rounded-2xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA] font-medium">Dividiu em quantas pessoas?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onChangeDivisao(item.id, Math.max(0, divisorAtual - 1))}
                          aria-label={`Diminuir divisão de ${item.descricao}`}
                          className="w-7 h-7 rounded-lg bg-[#202026] text-white hover:bg-[#2C2C35] flex items-center justify-center font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>

                        {/* Campo Aberto de Inteiro */}
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={divisorAtual === 0 ? '' : divisorAtual}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            onChangeDivisao(item.id, isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          placeholder="0"
                          aria-label={`Quantidade de pessoas dividindo ${item.descricao}`}
                          className="w-12 h-7 bg-[#101013] border border-[#2E2E38] rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-[#FACC15]"
                        />

                        <button
                          type="button"
                          onClick={() => onChangeDivisao(item.id, divisorAtual + 1)}
                          aria-label={`Aumentar divisão de ${item.descricao}`}
                          className="w-7 h-7 rounded-lg bg-[#202026] text-white hover:bg-[#2C2C35] flex items-center justify-center font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Atalhos Rápidos de 1 toque */}
                    <div className="grid grid-cols-5 gap-1">
                      <button
                        type="button"
                        onClick={() => onChangeDivisao(item.id, 0)}
                        className={`py-1 rounded-xl text-xs font-semibold transition-all border ${
                          divisorAtual === 0
                            ? 'bg-[#202026] border-[#3F3F46] text-[#A1A1AA]'
                            : 'bg-transparent border-[#23232A] text-[#71717A] hover:text-white'
                        }`}
                      >
                        Não
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeDivisao(item.id, 1)}
                        className={`py-1 rounded-xl text-xs font-semibold transition-all border ${
                          divisorAtual === 1
                            ? 'bg-[#FACC15] border-[#FACC15] text-[#0A0A0C] font-bold shadow'
                            : 'bg-[#151518] border-[#2C2C35] text-[#D4D4D8] hover:border-[#FACC15]'
                        }`}
                      >
                        Sozinho
                      </button>

                      {[2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => onChangeDivisao(item.id, n)}
                          className={`py-1 rounded-xl text-xs font-semibold transition-all border ${
                            divisorAtual === n
                              ? 'bg-[#FACC15] border-[#FACC15] text-[#0A0A0C] font-bold shadow'
                              : 'bg-[#151518] border-[#2C2C35] text-[#D4D4D8] hover:border-[#FACC15]'
                          }`}
                        >
                          ÷ {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Barra de Checkout com One Big Number */}
      <div className="border-t border-[#23232A] pt-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs uppercase tracking-wider text-[#A1A1AA]">
            Sua Parte {taxaServico > 0 ? `(+${taxaServico}%)` : ''}
          </span>
          <span className="text-2xl font-black font-mono text-[#FACC15]">
            R$ {totalPagar.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={onAvancarParaPagamento}
          disabled={totalPagar <= 0}
          className="w-full h-[60px] min-h-[60px] bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-[#202026] disabled:text-[#71717A] text-[#0A0A0C] font-bold text-lg rounded-2xl flex items-center justify-center shadow-lg transition-all"
        >
          Pagar via Pix (R$ {totalPagar.toFixed(2)})
        </button>
      </div>
    </div>
  );
};
