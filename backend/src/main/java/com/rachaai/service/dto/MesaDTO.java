package com.rachaai.service.dto;

import com.rachaai.domain.Mesa;
import com.rachaai.domain.ModoMesa;
import com.rachaai.domain.StatusMesa;

import java.math.BigDecimal;
import java.time.Instant;

public record MesaDTO(
        Long id,
        String codigoHash,
        String nomeRole,
        String chavePixHost,
        String nomeHost,
        String tokenHost,
        ModoMesa modo,
        BigDecimal taxaServico,
        StatusMesa status,
        Instant criadoEm,
        Instant expiraEm
) {
    public static MesaDTO fromDomain(Mesa mesa, boolean incluirTokenHost) {
        return new MesaDTO(
                mesa.getId(),
                mesa.getCodigoHash(),
                mesa.getNomeRole(),
                mesa.getChavePixHost(),
                mesa.getNomeHost(),
                incluirTokenHost ? mesa.getTokenHost() : null,
                mesa.getModo(),
                mesa.getTaxaServico(),
                mesa.getStatus(),
                mesa.getCriadoEm(),
                mesa.getExpiraEm()
        );
    }
}
