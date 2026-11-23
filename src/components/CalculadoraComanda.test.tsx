import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CalculadoraComanda } from './CalculadoraComanda';

describe('CalculadoraComanda Minimalista com Quantidade e Valor (AD-019)', () => {
  it('deve renderizar os campos de produto, quantidade, valor e botão +', () => {
    render(<CalculadoraComanda onAddItem={vi.fn()} />);

    expect(screen.getByPlaceholderText('caipirinha')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade')).toHaveValue(1);
    expect(screen.getByPlaceholderText('12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar item/i })).toBeInTheDocument();
  });

  it('deve adicionar item calculando quantidade * valor unitário', () => {
    const handleAdd = vi.fn();
    render(<CalculadoraComanda onAddItem={handleAdd} />);

    fireEvent.change(screen.getByPlaceholderText('caipirinha'), { target: { value: 'Chopp' } });
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('12'), { target: { value: '10.00' } });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar item/i }));

    expect(handleAdd).toHaveBeenCalledWith({
      descricao: 'Chopp',
      quantidade: 3,
      valorTotal: 30.00,
    });
  });

  it('deve usar quantidade padrão 1 se não for alterada', () => {
    const handleAdd = vi.fn();
    render(<CalculadoraComanda onAddItem={handleAdd} />);

    fireEvent.change(screen.getByPlaceholderText('caipirinha'), { target: { value: 'caipirinha' } });
    fireEvent.change(screen.getByPlaceholderText('12'), { target: { value: '18.50' } });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar item/i }));

    expect(handleAdd).toHaveBeenCalledWith({
      descricao: 'caipirinha',
      quantidade: 1,
      valorTotal: 18.50,
    });
  });

  it('deve validar campos vazios e exibir alerta', () => {
    const handleAdd = vi.fn();
    render(<CalculadoraComanda onAddItem={handleAdd} />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar item/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Informe o nome do item/i);
    expect(handleAdd).not.toHaveBeenCalled();
  });
});
