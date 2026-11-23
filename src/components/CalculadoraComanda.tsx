import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export interface ItemComandaInput {
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

interface CalculadoraComandaProps {
  onAddItem: (item: ItemComandaInput) => void;
}

export const CalculadoraComanda: React.FC<CalculadoraComandaProps> = ({ onAddItem }) => {
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState<string>('1');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleAdd = () => {
    const nomeLimpo = descricao.trim();
    if (!nomeLimpo) {
      setErro('Informe o nome do item.');
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      setErro('Informe uma quantidade válida.');
      return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) {
      setErro('Informe um valor válido.');
      return;
    }

    const total = parseFloat((precoNum * qtdNum).toFixed(2));

    setErro(null);
    onAddItem({
      descricao: nomeLimpo,
      quantidade: qtdNum,
      valorTotal: total,
    });

    setDescricao('');
    setQuantidade('1');
    setPreco('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-1.5">
      {/* Barra Única Horizontal com Produto, Quantidade, Valor e Botão + */}
      <div className="flex items-center gap-2 bg-[#121215] border border-[#27272A] rounded-2xl px-3 py-2 shadow-lg focus-within:border-[#FACC15]/60 transition-all">
        {/* Prompt Terminal > */}
        <span className="text-[#FACC15] font-mono font-bold text-lg select-none leading-none pl-1">
          {'>'}
        </span>

        {/* Input Nome do Produto */}
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="caipirinha"
          aria-label="Nome do produto"
          className="flex-1 bg-transparent border-none text-white placeholder-[#71717A] text-sm sm:text-base font-mono focus:outline-none min-w-[90px]"
        />

        {/* Box Quantidade */}
        <div className="bg-[#202026] hover:bg-[#25252D] border border-[#2E2E38] rounded-xl w-14 h-10 flex items-center justify-center transition-colors">
          <input
            type="number"
            min={1}
            max={999}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="1"
            aria-label="Quantidade"
            title="Quantidade"
            className="w-full bg-transparent text-white placeholder-[#71717A] text-sm font-mono font-bold text-center focus:outline-none px-1"
          />
        </div>

        {/* Box Valor / Preço Unitário */}
        <div className="bg-[#202026] hover:bg-[#25252D] border border-[#2E2E38] rounded-xl w-16 h-10 flex items-center justify-center transition-colors">
          <input
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="12"
            aria-label="Valor do item"
            title="Valor unitário"
            className="w-full bg-transparent text-white placeholder-[#71717A] text-sm font-mono font-bold text-center focus:outline-none px-1"
          />
        </div>

        {/* Botão Amarelo de Adicionar + */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Adicionar item"
          className="w-10 h-10 min-w-10 bg-[#FACC15] hover:bg-[#EAB308] active:scale-95 text-[#0A0A0C] font-black rounded-xl flex items-center justify-center shadow transition-transform cursor-pointer"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {erro && (
        <p role="alert" className="text-xs text-[#F87171] font-medium px-2">
          {erro}
        </p>
      )}
    </div>
  );
};
