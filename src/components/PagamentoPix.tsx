import React, { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';

interface PagamentoPixProps {
  valorTotal: number;
  chavePix: string;
  nomeHost: string;
  payloadPix: string;
  onDeclararPago: () => void;
  statusQuitacao?: string;
}

export const PagamentoPix: React.FC<PagamentoPixProps> = ({
  valorTotal,
  chavePix,
  nomeHost,
  payloadPix,
  onDeclararPago,
  statusQuitacao = 'CONSUMINDO',
}) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(payloadPix);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const isDeclarou = statusQuitacao === 'DECLAROU_PAGO';
  const isConfirmado = statusQuitacao === 'CONFIRMADO';

  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-6 text-white text-center shadow-2xl space-y-6">
      <div className="space-y-1">
        <span className="text-xs uppercase tracking-widest text-[#A1A1AA] font-semibold">Sua Cota Final</span>
        {/* One Big Number */}
        <div className="text-5xl font-black font-mono tracking-tight text-[#FACC15] py-2">
          R$ {valorTotal.toFixed(2)}
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Pague direto para <span className="text-white font-semibold">{nomeHost}</span>
        </p>
      </div>

      <div className="bg-[#101013] border border-[#23232A] rounded-2xl p-4 text-left space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#A1A1AA]">Chave Pix</span>
          <span className="font-mono text-white text-xs truncate max-w-[200px]">{chavePix}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#A1A1AA]">Banco / Método</span>
          <span className="text-[#34D399] font-medium flex items-center gap-1">
            <QrCode size={13} /> Pix Copia e Cola
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Botão Primário 60px Copiar Pix */}
        <button
          type="button"
          onClick={handleCopiar}
          className="w-full h-[60px] min-h-[60px] bg-[#FACC15] hover:bg-[#EAB308] active:scale-[0.98] text-[#0A0A0C] font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
        >
          {copiado ? (
            <>
              <Check size={22} className="text-[#0A0A0C]" />
              Pix Copiado! Abra o Banco
            </>
          ) : (
            <>
              <Copy size={20} />
              Copiar Código Pix
            </>
          )}
        </button>

        {/* Botão Secundário / Confirmação */}
        {isConfirmado ? (
          <div className="p-3.5 bg-[#34D399]/15 border border-[#34D399] text-[#34D399] rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5">
            <Check size={18} />
            Pagamento Confirmado pelo Anfitrião!
          </div>
        ) : isDeclarou ? (
          <div className="p-3.5 bg-[#FB923C]/15 border border-[#FB923C] text-[#FB923C] rounded-2xl font-medium text-xs">
            Aguardando anfitrião conferir o extrato...
          </div>
        ) : (
          <button
            type="button"
            onClick={onDeclararPago}
            className="w-full h-[52px] bg-[#202026] hover:bg-[#2C2C35] text-white font-medium text-sm rounded-2xl border border-[#2C2C35] transition-colors"
          >
            Já Fiz o Pix
          </button>
        )}
      </div>
    </div>
  );
};
