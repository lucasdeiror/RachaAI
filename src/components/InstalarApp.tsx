import React, { useState } from 'react';
import { useInstalar } from '../hooks/usePwa';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const InstalarApp: React.FC = () => {
  const { modo, instalado, instalar } = useInstalar();
  const [mostrarModalIos, setMostrarModalIos] = useState(false);

  if (instalado || !modo) {
    return null;
  }

  const handleClique = () => {
    if (modo === 'botao') {
      instalar();
    } else if (modo === 'iphone') {
      setMostrarModalIos(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClique}
        className="px-2.5 py-1 bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
        title="Instalar RachaAI na tela inicial"
      >
        <Download size={13} className="animate-bounce" />
        <span>Instalar App</span>
      </button>

      {/* Modal explicativo para Safari no iOS */}
      {mostrarModalIos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-[380px] bg-[#151518] border border-[#27272A] rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FACC15]/10 text-[#FACC15] flex items-center justify-center">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instalar no iPhone</h3>
                  <p className="text-[11px] text-[#A1A1AA]">Acesso direto sem barra do Safari</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalIos(false)}
                className="text-[#71717A] hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#D4D4D8]">
              <div className="flex items-start gap-3 bg-[#101013] p-3 rounded-2xl border border-[#23232A]">
                <div className="p-2 rounded-xl bg-[#202026] text-[#FACC15] shrink-0">
                  <Share2 size={18} />
                </div>
                <div>
                  <strong className="text-white block font-semibold mb-0.5">1. Toque em Compartilhar</strong>
                  Na barra inferior do Safari, toque no ícone do quadrado com a seta para cima (⬆️).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#101013] p-3 rounded-2xl border border-[#23232A]">
                <div className="p-2 rounded-xl bg-[#202026] text-[#FACC15] shrink-0">
                  <PlusSquare size={18} />
                </div>
                <div>
                  <strong className="text-white block font-semibold mb-0.5">2. Adicionar à Tela de Início</strong>
                  Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMostrarModalIos(false)}
              className="w-full py-3 bg-[#202026] hover:bg-[#2C2C35] text-xs font-bold text-white rounded-2xl border border-[#2E2E38] transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
