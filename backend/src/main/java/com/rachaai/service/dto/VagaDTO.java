package com.rachaai.service.dto;

import com.rachaai.domain.StatusVaga;
import com.rachaai.domain.VagaItem;

import java.math.BigDecimal;

public record VagaDTO(
        Long id,
        Long participanteId,
        BigDecimal valorVaga,
        StatusVaga status
) {
    public static VagaDTO fromDomain(VagaItem vaga) {
        return new VagaDTO(
                vaga.getId(),
                vaga.getParticipanteId(),
                vaga.getValorVaga(),
                vaga.getStatus()
        );
    }
}
