import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PagamentoPix } from './PagamentoPix';

describe('PagamentoPix (T20)', () => {
  it('deve exibir One Big Number e botão de 60px Copiar Código Pix', () => {
    render(
      <PagamentoPix
        valorTotal={45.50}
        chavePix="lucas@pix.com"
        nomeHost="Lucas"
        payloadPix="000201..."
        onDeclararPago={vi.fn()}
      />
    );

    expect(screen.getByText('R$ 45.50')).toBeInTheDocument();
    expect(screen.getByText('lucas@pix.com')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Copiar Código Pix/i });
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveClass('h-[60px]');
  });

  it('deve acionar declaração de pagamento ao clicar em "Já Fiz o Pix"', () => {
    const handleDeclarar = vi.fn();
    render(
      <PagamentoPix
        valorTotal={45.50}
        chavePix="lucas@pix.com"
        nomeHost="Lucas"
        payloadPix="000201..."
        onDeclararPago={handleDeclarar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Já Fiz o Pix/i }));
    expect(handleDeclarar).toHaveBeenCalled();
  });

  it('deve exibir feedback quando confirmado', () => {
    render(
      <PagamentoPix
        valorTotal={45.50}
        chavePix="lucas@pix.com"
        nomeHost="Lucas"
        payloadPix="000201..."
        onDeclararPago={vi.fn()}
        statusQuitacao="CONFIRMADO"
      />
    );

    expect(screen.getByText(/Pagamento Confirmado pelo Anfitrião/i)).toBeInTheDocument();
  });
});
