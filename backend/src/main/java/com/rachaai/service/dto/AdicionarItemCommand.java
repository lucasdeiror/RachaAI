package com.rachaai.service.dto;

import com.rachaai.domain.TipoItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AdicionarItemCommand(
        @NotBlank(message = "Descrição é obrigatória") String descricao,
        int quantidade,
        @NotNull(message = "Valor total é obrigatório") BigDecimal valorTotal,
        @NotNull(message = "Tipo de item é obrigatório") TipoItem tipo,
        Long participanteId,
        int vagasTotais
) {}
