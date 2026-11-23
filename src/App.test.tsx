import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { App } from './App';

describe('Separação de Papéis e Criação de Salas (App.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('deve cair como Host (Criar Mesa) se entrar por conta própria sem parâmetros', () => {
    render(<App />);

    // Formulário de Host deve ser exibido diretamente
    expect(screen.getByText(/Abrir Conta do Bar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Lucas/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CPF, celular, e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir Mesa Agora/i })).toBeInTheDocument();
  });

  it('deve cair na tela de Convidado se entrar por link com parâmetro mesa', () => {
    window.history.pushState({}, '', '/?mesa=ROL-1234&host=Lucas&pix=lucas@pix.me');
    render(<App />);

    // Tela de entrada do convidado
    expect(screen.getByText(/Conta de Lucas/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Danilo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Mesa/i })).toBeInTheDocument();
    expect(screen.getByText(/Criar Nova Sala/i)).toBeInTheDocument();
  });

  it('deve permitir ao convidado criar sua própria mesa ao clicar em "Criar Nova Sala"', () => {
    window.history.pushState({}, '', '/?mesa=ROL-1234&host=Lucas&pix=lucas@pix.me');
    render(<App />);

    const btnCriarSala = screen.getByText(/Criar Nova Sala/i);
    fireEvent.click(btnCriarSala);

    // Agora deve estar na tela de Host (Criar Mesa)
    expect(screen.getByText(/Abrir Conta do Bar/i)).toBeInTheDocument();
  });
});
