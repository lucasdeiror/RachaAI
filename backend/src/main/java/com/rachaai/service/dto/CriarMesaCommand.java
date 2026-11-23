package com.rachaai.service.dto;

import com.rachaai.domain.ModoMesa;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record CriarMesaCommand(
        String nomeRole,
        @NotBlank(message = "Chave Pix é obrigatória") String chavePixHost,
        @NotBlank(message = "Nome do anfitrião é obrigatório") String nomeHost,
        ModoMesa modo,
        BigDecimal taxaServico
) {}
