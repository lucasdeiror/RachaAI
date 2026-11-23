import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SelecaoConsumo, ItemComanda } from './SelecaoConsumo';

describe('SelecaoConsumo — Divisão Dinâmica pelo Convidado (T19 / Item 4)', () => {
  const itensMock: ItemComanda[] = [
    { id: 1, descricao: 'Batata Frita', quantidade: 1, valorTotal: 38.00 },
    { id: 2, descricao: 'Chopp Pilsen', quantidade: 2, valorTotal: 24.00 },
  ];

  it('deve renderizar os itens e botões de fatia declarada (Não, Sozinho, ÷ 2, ÷ 3, ÷ 4) e campo aberto', () => {
    render(
      <SelecaoConsumo
        itens={itensMock}
        consumoMap={{}}
        taxaServico={10}
        onChangeDivisao={vi.fn()}
        onAvancarParaPagamento={vi.fn()}
      />
    );

    expect(screen.getByText('Batata Frita')).toBeInTheDocument();
    expect(screen.getByText('Chopp Pilsen')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sozinho' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /÷\s*2/ })).toHaveLength(2);
    expect(screen.getByLabelText(/Quantidade de pessoas dividindo Batata Frita/i)).toBeInTheDocument();
  });

  it('deve permitir ao convidado escolher dividir por 2 e refletir a cota', () => {
    const handleChange = vi.fn();
    render(
      <SelecaoConsumo
        itens={itensMock}
        consumoMap={{ 1: 2 }} // Batata R$ 38 / 2 = R$ 19,00
        taxaServico={10} // 19 + 10% = 20.90
        onChangeDivisao={handleChange}
        onAvancarParaPagamento={vi.fn()}
      />
    );

    expect(screen.getAllByText(/20\.90/i).length).toBeGreaterThanOrEqual(1);

    const btnDiv3 = screen.getAllByRole('button', { name: /÷\s*3/ })[0];
    fireEvent.click(btnDiv3);
    expect(handleChange).toHaveBeenCalledWith(1, 3);
  });
});
