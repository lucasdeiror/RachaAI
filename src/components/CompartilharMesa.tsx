import React, { useState } from 'react';
import { Copy, Check, Share2, QrCode, X } from 'lucide-react';

import { ItemComanda } from './SelecaoConsumo';

interface CompartilharMesaProps {
  codigoHash: string;
  nomeHost: string;
  chavePixHost?: string;
  taxaServico?: number;
  itens?: ItemComanda[];
  onFechar?: () => void;
  inline?: boolean;
}

export const CompartilharMesa: React.FC<CompartilharMesaProps> = ({
  codigoHash,
  nomeHost,
  chavePixHost,
  taxaServico,
  itens,
  onFechar,
  inline = false,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);

  let queryParams = `mesa=${encodeURIComponent(codigoHash)}`;
  if (nomeHost) queryParams += `&host=${encodeURIComponent(nomeHost)}`;
  if (chavePixHost) queryParams += `&pix=${encodeURIComponent(chavePixHost)}`;
  if (taxaServico !== undefined) queryParams += `&taxa=${taxaServico}`;
  if (itens && itens.length > 0) {
    const compactItens = itens.map((i) => ({
      id: i.id,
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorTotal: i.valorTotal,
    }));
    queryParams += `&itens=${encodeURIComponent(JSON.stringify(compactItens))}`;
  }

  const urlMesa = typeof window !== 'undefined'
    ? `${window.location.origin}/?${queryParams}`
    : `https://rachaai.com/?${queryParams}`;

  const handleCopiarLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(urlMesa);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompartilharWhatsApp = () => {
    const texto = encodeURIComponent(
      `🍻 Galera, a conta tá aberta no RachaAI! Entra aí pra marcar o que consumiu e pagar no Pix:\n${urlMesa}`
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  const content = (
    <div className="w-full bg-[#151518] border border-[#23232A] rounded-3xl p-5 text-white shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FACC15]/10 text-[#FACC15] flex items-center justify-center">
            <Share2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Chamar a Galera</h3>
            <p className="text-[11px] text-[#A1A1AA]">Mesa: <span className="font-mono text-[#FACC15] font-bold">{codigoHash}</span></p>
          </div>
        </div>

        {onFechar && (
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="text-[#71717A] hover:text-white p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Ações Rápidas de Compartilhamento */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopiarLink}
          className="py-3 px-3 bg-[#202026] hover:bg-[#2C2C35] border border-[#2C2C35] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {copiado ? <Check size={16} className="text-[#34D399]" /> : <Copy size={16} />}
          {copiado ? 'Link Copiado!' : 'Copiar Link'}
        </button>

        <button
          type="button"
          onClick={handleCompartilharWhatsApp}
          className="py-3 px-3 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          WhatsApp
        </button>
      </div>

      {/* Toggle QR Code */}
      <button
        type="button"
        onClick={() => setMostrarQr((v) => !v)}
        className="w-full py-2.5 bg-[#101013] hover:bg-[#151518] border border-[#23232A] rounded-xl text-xs text-[#A1A1AA] hover:text-white flex items-center justify-center gap-2 font-medium transition-colors"
      >
        <QrCode size={15} />
        {mostrarQr ? 'Ocultar QR Code' : 'Mostrar QR Code na Mesa'}
      </button>

      {mostrarQr && (
        <div className="bg-[#FFFFFF] p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in-95">
          {/* Gerador visual de QR Code SVG limpo */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlMesa)}`}
            alt={`QR Code da mesa ${codigoHash}`}
            className="w-40 h-40"
          />
          <span className="text-[11px] font-mono font-bold text-[#0A0A0C]">
            Aponte a câmera para entrar
          </span>
        </div>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {content}
      </div>
    </div>
  );
};
