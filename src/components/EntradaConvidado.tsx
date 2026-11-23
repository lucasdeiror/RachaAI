import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface EntradaConvidadoProps {
  nomeHost: string;
  onEntrar: (nome: string) => void;
  onCriarNovaMesa?: () => void;
  isLoading?: boolean;
}

export const EntradaConvidado: React.FC<EntradaConvidadoProps> = ({
  nomeHost,
  onEntrar,
  onCriarNovaMesa,
  isLoading,
}) => {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Informe seu primeiro nome ou apelido.');
      return;
    }

    setErro(null);
    onEntrar(nome.trim());
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#151518] border border-[#23232A] rounded-3xl p-6 text-white shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Users size={28} />
        </div>
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#FACC15] bg-[#FACC15]/10 px-3 py-1 rounded-full">
          Mesa Aberta
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Conta de {nomeHost}</h1>
        <p className="text-xs text-[#A1A1AA]">
          Sem cadastro e sem senha. Marque o que consumiu e pague no Pix.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <div role="alert" className="p-3 bg-[#F87171]/10 border border-[#F87171] text-[#F87171] rounded-2xl text-xs font-semibold">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#A1A1AA] mb-2 font-semibold">
            Como a galera te chama?
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Danilo"
            className="w-full bg-[#101013] border border-[#2C2C35] rounded-2xl px-4 py-3.5 text-white placeholder-[#71717A] text-base focus:outline-none focus:border-[#FACC15] transition-colors"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[60px] min-h-[60px] bg-[#FACC15] hover:bg-[#EAB308] active:scale-[0.98] text-[#0A0A0C] font-bold text-lg rounded-2xl flex items-center justify-center shadow-lg transition-all"
        >
          {isLoading ? 'Entrando...' : 'Entrar na Mesa'}
        </button>
      </form>

      {onCriarNovaMesa && (
        <div className="pt-2 border-t border-[#23232A] text-center">
          <button
            type="button"
            onClick={onCriarNovaMesa}
            className="text-xs text-[#A1A1AA] hover:text-[#FACC15] font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <span>👑 Quer abrir sua própria mesa?</span>
            <span className="text-[#FACC15] font-bold underline">Criar Nova Sala</span>
          </button>
        </div>
      )}
    </div>
  );
};
