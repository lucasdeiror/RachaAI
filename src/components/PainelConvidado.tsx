import React, { useState } from 'react';
import { CalculadoraComanda, ItemComandaInput } from './CalculadoraComanda';
import { ItemComanda, ConsumoParticipanteMap } from './SelecaoConsumo';
import { EntradaConvidado } from './EntradaConvidado';
import { PagamentoPix } from './PagamentoPix';
import { gerarPayloadPix } from '../utils/pix';
import { ArrowLeft, Check, QrCode, Receipt, Sparkles } from 'lucide-react';

interface PainelConvidadoProps {
  codigoHash: string;
  nomeHost: string;
  chavePixHost: string;
  taxaServico: number;
  itens: ItemComanda[];
  onAddItem: (item: ItemComandaInput) => void;
  onDeclararPago: (nomeConvidado: string, valor: number) => void;
  onVoltarParaHost?: () => void;
}

export const PainelConvidado: React.FC<PainelConvidadoProps> = ({
  codigoHash,
  nomeHost,
  chavePixHost,
  taxaServico,
  itens,
  onAddItem,
  onDeclararPago,
  onVoltarParaHost,
}) => {
  const [nomeConvidado, setNomeConvidado] = useState<string>('');
  const [etapa, setEtapa] = useState<'ENTRADA' | 'COMANDA' | 'PAGAMENTO' | 'STATUS'>('ENTRADA');
  const [consumoMap, setConsumoMap] = useState<ConsumoParticipanteMap>({});
  const [statusQuitacao, setStatusQuitacao] = useState<'CONSUMINDO' | 'DECLAROU_PAGO' | 'CONFIRMADO'>('CONSUMINDO');

  const handleEntrar = (nome: string) => {
    setNomeConvidado(nome);
    setEtapa('COMANDA');
  };

  const handleChangeDivisao = (itemId: number, divisao: number) => {
    setConsumoMap((prev) => ({
      ...prev,
      [itemId]: divisao,
    }));
  };

  // Cálculo da cota pessoal do convidado
  let subtotalConsumo = 0;
  itens.forEach((item) => {
    const divisor = consumoMap[item.id] || 0;
    if (divisor > 0) {
      subtotalConsumo += item.valorTotal / divisor;
    }
  });

  const valorTaxa = (subtotalConsumo * taxaServico) / 100;
  const valorFinalConvidado = subtotalConsumo + valorTaxa;

  const handleConcluirPix = () => {
    setStatusQuitacao('DECLAROU_PAGO');
    onDeclararPago(nomeConvidado, valorFinalConvidado);
    setEtapa('STATUS');
  };

  // 1. Tela de Entrada do Convidado
  if (etapa === 'ENTRADA') {
    return (
      <div className="space-y-3">
        <EntradaConvidado nomeHost={nomeHost} onEntrar={handleEntrar} />
        {onVoltarParaHost && (
          <button
            type="button"
            onClick={onVoltarParaHost}
            className="w-full py-2.5 text-xs text-[#71717A] hover:text-[#A1A1AA] text-center"
          >
            ← Voltar para a visão do Anfitrião ({nomeHost})
          </button>
        )}
      </div>
    );
  }

  // 2. Tela de Comanda do Convidado (Lançamento colaborativo + Escolha de Fatias)
  if (etapa === 'COMANDA') {
    return (
      <div className="w-full max-w-[420px] mx-auto space-y-4">
        {/* Header do Convidado */}
        <div className="bg-[#151518] border border-[#23232A] rounded-3xl p-4 text-white shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-full font-bold">
                Convidado
              </span>
              <span className="text-xs text-[#71717A] font-mono">#{codigoHash}</span>
            </div>
            <h1 className="text-base font-bold text-white mt-0.5">{nomeConvidado}</h1>
            <p className="text-[11px] text-[#A1A1AA]">
              Mesa de <strong className="text-white">{nomeHost}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] block">Sua Cota</span>
            <span className="text-lg font-black font-mono text-[#FACC15]">
              R$ {valorFinalConvidado.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Lançamento Rápido: Convidado pode adicionar o que pediu */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={13} className="text-[#FACC15]" /> Pediu algo novo? Lance aqui:
            </span>
          </div>
          <CalculadoraComanda onAddItem={onAddItem} />
        </div>

        {/* Lista de Itens com Seleção de Fatias */}
        <div className="bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-xl space-y-4">
          <div className="border-b border-[#23232A] pb-3">
            <h2 className="text-base font-bold">O que você consumiu?</h2>
            <p className="text-xs text-[#A1A1AA]">
              Marque se consumiu sozinho ou escolha com quantos amigos dividiu
            </p>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {itens.length === 0 ? (
              <div className="text-center py-8 text-[#71717A] space-y-1">
                <p className="text-sm font-semibold">Nenhum item na comanda ainda.</p>
                <p className="text-xs">Lance o que você pediu na barra acima!</p>
              </div>
            ) : (
              itens.map((item) => {
                const divisorAtual = consumoMap[item.id] || 0;
                const valorCota = divisorAtual > 0 ? item.valorTotal / divisorAtual : 0;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#101013] border rounded-2xl p-3.5 space-y-2.5 transition-colors ${
                      divisorAtual > 0 ? 'border-[#FACC15]/50 bg-[#FACC15]/5' : 'border-[#23232A]'
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
                            onClick={() => handleChangeDivisao(item.id, Math.max(0, divisorAtual - 1))}
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
                              handleChangeDivisao(item.id, isNaN(val) ? 0 : Math.max(0, val));
                            }}
                            placeholder="0"
                            aria-label={`Quantidade de pessoas dividindo ${item.descricao}`}
                            className="w-12 h-7 bg-[#101013] border border-[#2E2E38] rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-[#FACC15]"
                          />

                          <button
                            type="button"
                            onClick={() => handleChangeDivisao(item.id, divisorAtual + 1)}
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
                          onClick={() => handleChangeDivisao(item.id, 0)}
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
                          onClick={() => handleChangeDivisao(item.id, 1)}
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
                            onClick={() => handleChangeDivisao(item.id, n)}
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

          {/* Resumo da Cota & Botão de Checkout 60px */}
          <div className="pt-3 border-t border-[#23232A] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Consumo pessoal</span>
                <span className="font-mono text-white">R$ {subtotalConsumo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Taxa de serviço ({taxaServico}%)</span>
                <span className="font-mono text-white">R$ {valorTaxa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#23232A]">
                <span className="text-white">Total da sua parte</span>
                <span className="font-mono text-[#FACC15] text-base">R$ {valorFinalConvidado.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={valorFinalConvidado <= 0}
              onClick={() => setEtapa('PAGAMENTO')}
              className={`w-full h-[60px] min-h-[60px] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${
                valorFinalConvidado > 0
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] active:scale-[0.98] text-[#0A0A0C] cursor-pointer'
                  : 'bg-[#23232A] text-[#71717A] cursor-not-allowed'
              }`}
            >
              <QrCode size={20} />
              {valorFinalConvidado > 0
                ? `Pagar Minha Parte (R$ ${valorFinalConvidado.toFixed(2)})`
                : 'Selecione itens para pagar'}
            </button>
          </div>
        </div>

        {onVoltarParaHost && (
          <button
            type="button"
            onClick={onVoltarParaHost}
            className="w-full py-2.5 text-xs text-[#71717A] hover:text-[#A1A1AA] text-center"
          >
            ← Voltar para a visão do Anfitrião ({nomeHost})
          </button>
        )}
      </div>
    );
  }

  // 3. Tela de Pagamento Pix do Convidado (Pagar o Host)
  if (etapa === 'PAGAMENTO') {
    return (
      <div className="w-full max-w-[420px] mx-auto space-y-4">
        <PagamentoPix
          valorTotal={valorFinalConvidado}
          chavePix={chavePixHost}
          nomeHost={nomeHost}
          payloadPix={gerarPayloadPix(chavePixHost, nomeHost, 'SAO PAULO', valorFinalConvidado, codigoHash)}
          statusQuitacao={statusQuitacao}
          onDeclararPago={handleConcluirPix}
        />

        <button
          type="button"
          onClick={() => setEtapa('COMANDA')}
          className="w-full py-2.5 text-xs text-[#A1A1AA] hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={13} /> Voltar para ajustar itens da comanda
        </button>
      </div>
    );
  }

  // 4. Tela de Status / Recibo do Convidado
  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-6 text-white shadow-2xl text-center space-y-6">
      <div className="space-y-2">
        <div className="w-16 h-16 bg-[#34D399]/15 border border-[#34D399] text-[#34D399] rounded-full mx-auto flex items-center justify-center">
          <Check size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tudo Certo, {nomeConvidado}!</h1>
        <p className="text-xs text-[#A1A1AA]">
          Você avisou ao <strong className="text-white">{nomeHost}</strong> que fez o Pix de:
        </p>
        <div className="text-4xl font-black font-mono text-[#FACC15] py-2">
          R$ {valorFinalConvidado.toFixed(2)}
        </div>
      </div>

      <div className="bg-[#101013] border border-[#23232A] rounded-2xl p-4 text-left space-y-2 text-xs">
        <div className="flex justify-between text-[#A1A1AA]">
          <span>Destinatário</span>
          <span className="text-white font-semibold">{nomeHost} (Anfitrião)</span>
        </div>
        <div className="flex justify-between text-[#A1A1AA]">
          <span>Chave Pix</span>
          <span className="font-mono text-white">{chavePixHost}</span>
        </div>
        <div className="flex justify-between text-[#A1A1AA]">
          <span>Status</span>
          <span className="text-[#FB923C] font-semibold">Aguardando confirmação do Host</span>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={() => setEtapa('COMANDA')}
          className="w-full py-3.5 bg-[#202026] hover:bg-[#2C2C35] text-xs font-bold text-white rounded-2xl border border-[#2E2E38] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Receipt size={14} /> Pediu mais alguma coisa? Voltar à Comanda
        </button>

        {onVoltarParaHost && (
          <button
            type="button"
            onClick={onVoltarParaHost}
            className="w-full py-2.5 text-xs text-[#71717A] hover:text-[#A1A1AA] text-center"
          >
            ← Ir para a visão do Anfitrião ({nomeHost})
          </button>
        )}
      </div>
    </div>
  );
};
