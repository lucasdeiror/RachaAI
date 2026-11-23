package com.rachaai.service.dto;

import com.rachaai.domain.Participante;
import com.rachaai.domain.StatusQuitacao;

import java.math.BigDecimal;

public record ParticipanteDTO(
        Long id,
        Long mesaId,
        String nome,
        String tokenSessao,
        StatusQuitacao statusQuitacao,
        BigDecimal valorConsumo,
        BigDecimal valorTaxa,
        BigDecimal valorFinal
) {
    public static ParticipanteDTO fromDomain(Participante p, boolean incluirToken) {
        return new ParticipanteDTO(
                p.getId(),
                p.getMesaId(),
                p.getNome(),
                incluirToken ? p.getTokenSessao() : null,
                p.getStatusQuitacao(),
                p.getValorConsumo(),
                p.getValorTaxa(),
                p.getValorFinal()
        );
    }
}
