import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PainelHost } from './PainelHost';

describe('PainelHost (Cockpit do Anfitrião)', () => {
  const mockProps = {
    codigoHash: 'ROL-1234',
    nomeHost: 'Lucas',
    chavePixHost: 'lucas@pix.me',
    taxaServico: 10,
    itens: [
      { id: 1, descricao: 'Batata Frita', quantidade: 1, valorTotal: 30 },
      { id: 2, descricao: 'Chopp', quantidade: 2, valorTotal: 20 },
    ],
    participantes: [
      { id: 1, nome: 'Lucas', statusQuitacao: 'CONFIRMADO' as const, valorFinal: 0 },
      { id: 2, nome: 'Danilo', statusQuitacao: 'CONFIRMADO' as const, valorFinal: 25 },
      { id: 3, nome: 'Mariana', statusQuitacao: 'DECLAROU_PAGO' as const, valorFinal: 15 },
    ],
    onAddItem: vi.fn(),
    onRemoverItem: vi.fn(),
    onConfirmarPagamento: vi.fn(),
    onMarcarPagoDinheiro: vi.fn(),
    onAbrirCompartilhar: vi.fn(),
    onAlternarParaConvidado: vi.fn(),
  };

  it('deve exibir métricas financeiras do anfitrião e não mostrar pix para pagar a si mesmo', () => {
    render(<PainelHost {...mockProps} />);

    // Total dos itens = 50 + 10% = 55.00
    expect(screen.getByText(/Conta de Lucas/i)).toBeInTheDocument();
    expect(screen.getByText(/lucas@pix\.me/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 55.00')).toBeInTheDocument(); // Conta Total
    expect(screen.getByText('R$ 25.00')).toBeInTheDocument(); // Já Recebeu (Danilo)
    expect(screen.getAllByText('R$ 30.00')).toHaveLength(2); // Falta Cair + Batata Frita

    // NÃO deve ter botão de copiar pix para o host pagar a si mesmo
    expect(screen.queryByText(/Copiar Código Pix/i)).not.toBeInTheDocument();
  });

  it('deve permitir ao anfitrião confirmar o Pix declarado pelo convidado com 1 toque', () => {
    render(<PainelHost {...mockProps} />);

    expect(screen.getByText('Mariana')).toBeInTheDocument();
    const btnConfirmar = screen.getByRole('button', { name: /Confirmar Pix/i });
    expect(btnConfirmar).toBeInTheDocument();

    fireEvent.click(btnConfirmar);
    expect(mockProps.onConfirmarPagamento).toHaveBeenCalledWith(3);
  });

  it('deve permitir ao anfitrião remover um item da mesa', () => {
    render(<PainelHost {...mockProps} />);

    const btnRemover = screen.getByRole('button', { name: /Remover Batata Frita/i });
    fireEvent.click(btnRemover);
    expect(mockProps.onRemoverItem).toHaveBeenCalledWith(1);
  });
});
