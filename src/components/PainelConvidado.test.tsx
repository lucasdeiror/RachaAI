import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PainelConvidado } from './PainelConvidado';

describe('PainelConvidado (Fluxo Completo do Convidado)', () => {
  const mockProps = {
    codigoHash: 'ROL-5678',
    nomeHost: 'Lucas',
    chavePixHost: 'lucas@pix.me',
    taxaServico: 10,
    itens: [
      { id: 1, descricao: 'Porção Batata', quantidade: 1, valorTotal: 40 },
      { id: 2, descricao: 'Caipirinha', quantidade: 1, valorTotal: 20 },
    ],
    onAddItem: vi.fn(),
    onDeclararPago: vi.fn(),
    onVoltarParaHost: vi.fn(),
  };

  it('deve passar pelo fluxo: Entrada -> Comanda com Lançamento -> Pagamento Pix -> Recibo', () => {
    render(<PainelConvidado {...mockProps} />);

    // 1. Tela de Entrada
    expect(screen.getByText(/Conta de Lucas/i)).toBeInTheDocument();
    const inputNome = screen.getByPlaceholderText(/Ex: Danilo/i);
    fireEvent.change(inputNome, { target: { value: 'Mariana' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar na Mesa/i }));

    // 2. Tela de Comanda do Convidado
    expect(screen.getByText('Mariana')).toBeInTheDocument();
    expect(screen.getByText('Porção Batata')).toBeInTheDocument();
    expect(screen.getByText('Caipirinha')).toBeInTheDocument();

    // Convidado pode lançar novo item (Ponto 1 do usuário)
    expect(screen.getByPlaceholderText('caipirinha')).toBeInTheDocument();

    // Seleciona que consumiu a Caipirinha inteira (Sozinho)
    const btnSozinho = screen.getAllByRole('button', { name: 'Sozinho' });
    fireEvent.click(btnSozinho[1]); // Caipirinha

    // Cota: 20 + 10% = 22.00
    const btnPagar = screen.getByRole('button', { name: /Pagar Minha Parte \(R\$ 22\.00\)/i });
    expect(btnPagar).toBeInTheDocument();
    fireEvent.click(btnPagar);

    // 3. Tela de Pagamento Pix (Ponto 2 do usuário: paga ao Host!)
    expect(screen.getByText(/Pague direto para/i)).toBeInTheDocument();
    expect(screen.getByText('Lucas')).toBeInTheDocument();
    expect(screen.getByText('lucas@pix.me')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar Código Pix/i })).toBeInTheDocument();

    // Clica em Já fiz o Pix
    const btnJaFizPix = screen.getByRole('button', { name: /Já fiz o Pix/i });
    fireEvent.click(btnJaFizPix);

    expect(mockProps.onDeclararPago).toHaveBeenCalledWith('Mariana', 22);

    // 4. Tela de Status / Recibo
    expect(screen.getByText(/Tudo Certo, Mariana!/i)).toBeInTheDocument();
    expect(screen.getByText(/Aguardando confirmação do Host/i)).toBeInTheDocument();
  });

  it('deve permitir ao convidado informar qualquer número inteiro no campo aberto de divisão', () => {
    render(<PainelConvidado {...mockProps} />);

    // Entra na mesa
    fireEvent.change(screen.getByPlaceholderText(/Ex: Danilo/i), { target: { value: 'João' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar na Mesa/i }));

    // Localiza o campo aberto de inteiro da Porção Batata (R$ 40,00)
    const inputDivisao = screen.getByLabelText(/Quantidade de pessoas dividindo Porção Batata/i);
    expect(inputDivisao).toBeInTheDocument();

    // Divide em 5 pessoas: R$ 40 / 5 = R$ 8,00 (+ 10% = R$ 8,80)
    fireEvent.change(inputDivisao, { target: { value: '5' } });

    expect(screen.getAllByText(/R\$ 8\.00/i)).toHaveLength(2); // Cota no item + Consumo pessoal no resumo
    expect(screen.getByRole('button', { name: /Pagar Minha Parte \(R\$ 8\.80\)/i })).toBeInTheDocument();
  });
});
