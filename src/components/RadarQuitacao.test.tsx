import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RadarQuitacao, ParticipanteRadar } from './RadarQuitacao';

describe('RadarQuitacao (T21)', () => {
  const participantesMock: ParticipanteRadar[] = [
    { id: 1, nome: 'Lucas', statusQuitacao: 'CONFIRMADO', valorFinal: 50.00 },
    { id: 2, nome: 'Danilo', statusQuitacao: 'DECLAROU_PAGO', valorFinal: 50.00 },
    { id: 3, nome: 'Gabi', statusQuitacao: 'CONSUMINDO', valorFinal: 0.00 },
  ];

  it('deve renderizar participantes e progresso', () => {
    render(
      <RadarQuitacao
        participantes={participantesMock}
        totalMesa={100.00}
        isHost={false}
      />
    );

    expect(screen.getByText('50% Pago')).toBeInTheDocument();
    expect(screen.getByText('Lucas')).toBeInTheDocument();
    expect(screen.getByText('Danilo')).toBeInTheDocument();
    expect(screen.getByText('Declarou Pago')).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('deve exibir botão "Confirmar 1-Toque" para o anfitrião e acionar callback', () => {
    const handleConfirmar = vi.fn();
    render(
      <RadarQuitacao
        participantes={participantesMock}
        totalMesa={100.00}
        isHost={true}
        onConfirmarPagamento={handleConfirmar}
      />
    );

    const btnConfirmar = screen.getByRole('button', { name: /Confirmar 1-Toque/i });
    expect(btnConfirmar).toBeInTheDocument();

    fireEvent.click(btnConfirmar);
    expect(handleConfirmar).toHaveBeenCalledWith(2);
  });
});
