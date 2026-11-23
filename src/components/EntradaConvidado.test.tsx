import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EntradaConvidado } from './EntradaConvidado';

describe('EntradaConvidado (T18 Simplificado)', () => {
  it('deve exibir nome do anfitrião e input simples de nome', () => {
    render(<EntradaConvidado nomeHost="Lucas" onEntrar={vi.fn()} />);

    expect(screen.getByText(/Conta de Lucas/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Danilo/i)).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /Entrar na Mesa/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('h-[60px]');
  });

  it('deve impedir envio com nome vazio', () => {
    const handleEntrar = vi.fn();
    render(<EntradaConvidado nomeHost="Lucas" onEntrar={handleEntrar} />);

    fireEvent.click(screen.getByRole('button', { name: /Entrar na Mesa/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Informe seu primeiro nome/i);
    expect(handleEntrar).not.toHaveBeenCalled();
  });

  it('deve chamar callback com nome preenchido', () => {
    const handleEntrar = vi.fn();
    render(<EntradaConvidado nomeHost="Lucas" onEntrar={handleEntrar} />);

    fireEvent.change(screen.getByPlaceholderText(/Ex: Danilo/i), { target: { value: 'Danilo' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar na Mesa/i }));

    expect(handleEntrar).toHaveBeenCalledWith('Danilo');
  });
});
