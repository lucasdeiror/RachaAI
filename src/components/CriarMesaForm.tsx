import React, { useState } from 'react';

export interface CriarMesaData {
  chavePixHost: string;
  nomeHost: string;
  taxaServico?: number;
}

interface CriarMesaFormProps {
  onSubmit: (data: CriarMesaData) => void;
  isLoading?: boolean;
}

export const CriarMesaForm: React.FC<CriarMesaFormProps> = ({ onSubmit, isLoading }) => {
  const [chavePixHost, setChavePixHost] = useState('');
  const [nomeHost, setNomeHost] = useState('');
  const [taxaServico, setTaxaServico] = useState<number>(10);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chavePixHost.trim()) {
      setErro('Informe sua chave Pix para receber dos amigos.');
      return;
    }
    if (!nomeHost.trim()) {
      setErro('Informe seu nome como anfitrião.');
      return;
    }

    setErro(null);
    onSubmit({
      chavePixHost: chavePixHost.trim(),
      nomeHost: nomeHost.trim(),
      taxaServico,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-6 text-white shadow-2xl space-y-6">
      <div className="border-b border-[#23232A] pb-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">Abrir Conta do Bar</h1>
        <p className="text-xs text-[#A1A1AA] mt-1">Direto ao ponto: informe seu Pix e comece a lançar</p>
      </div>

      {erro && (
        <div role="alert" className="p-3 bg-[#F87171]/10 border border-[#F87171] text-[#F87171] rounded-2xl text-xs font-semibold">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-semibold">Sua Chave Pix (Recebedor)</label>
          <input
            type="text"
            value={chavePixHost}
            onChange={(e) => setChavePixHost(e.target.value)}
            placeholder="CPF, celular, e-mail ou chave aleatória"
            className="w-full bg-[#101013] border border-[#2C2C35] rounded-2xl px-4 py-3.5 text-white placeholder-[#71717A] text-sm focus:outline-none focus:border-[#FACC15] transition-colors font-mono"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-semibold">Seu Nome</label>
          <input
            type="text"
            value={nomeHost}
            onChange={(e) => setNomeHost(e.target.value)}
            placeholder="Ex: Lucas"
            className="w-full bg-[#101013] border border-[#2C2C35] rounded-2xl px-4 py-3.5 text-white placeholder-[#71717A] text-sm focus:outline-none focus:border-[#FACC15] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="text-xs text-[#A1A1AA] font-medium">Taxa de Serviço do Bar</label>
          <div className="flex items-center gap-1.5">
            {[10, 12, 13, 0].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTaxaServico(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  taxaServico === t
                    ? 'bg-[#FACC15]/10 border-[#FACC15] text-[#FACC15]'
                    : 'bg-[#101013] border-[#2C2C35] text-[#71717A]'
                }`}
              >
                {t === 0 ? 'Sem taxa' : `${t}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-[60px] min-h-[60px] bg-[#FACC15] hover:bg-[#EAB308] active:scale-[0.98] text-[#0A0A0C] font-bold text-lg rounded-2xl flex items-center justify-center shadow-lg transition-transform"
      >
        {isLoading ? 'Abrindo...' : 'Abrir Mesa Agora'}
      </button>
    </form>
  );
};
