import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CriarMesaForm } from './CriarMesaForm';

describe('CriarMesaForm (T16 Simplificado)', () => {
  it('deve renderizar apenas Pix, Nome e botão de 60px', () => {
    render(<CriarMesaForm onSubmit={vi.fn()} />);

    expect(screen.queryByPlaceholderText(/Chopp no Bar do Zé/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CPF, celular, e-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Lucas/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Abrir Mesa Agora/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveClass('h-[60px]');
  });

  it('deve exibir mensagem de erro se tentar enviar com campos vazios', () => {
    const handleSubmit = vi.fn();
    render(<CriarMesaForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Abrir Mesa Agora/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Informe sua chave Pix/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter dados corretamente quando preenchido', () => {
    const handleSubmit = vi.fn();
    render(<CriarMesaForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/CPF, celular, e-mail/i), { target: { value: 'host@pix.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Lucas/i), { target: { value: 'Lucas' } });

    fireEvent.click(screen.getByRole('button', { name: /Abrir Mesa Agora/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      chavePixHost: 'host@pix.com',
      nomeHost: 'Lucas',
      taxaServico: 10,
    });
  });
});
