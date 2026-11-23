import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CompartilharMesa } from './CompartilharMesa';

describe('CompartilharMesa (T22 / Item 5)', () => {
  it('deve exibir botões de Copiar Link e WhatsApp', () => {
    render(<CompartilharMesa codigoHash="ROL-8492" nomeHost="Lucas" inline />);

    expect(screen.getByText(/ROL-8492/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar Link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mostrar QR Code/i })).toBeInTheDocument();
  });

  it('deve alternar a exibição do QR Code', () => {
    render(<CompartilharMesa codigoHash="ROL-8492" nomeHost="Lucas" inline />);

    const qrToggle = screen.getByRole('button', { name: /Mostrar QR Code/i });
    fireEvent.click(qrToggle);

    expect(screen.getByAltText(/QR Code da mesa ROL-8492/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ocultar QR Code/i })).toBeInTheDocument();
  });
});
