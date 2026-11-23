package com.rachaai.service.dto;

import com.rachaai.domain.ItemComanda;
import com.rachaai.domain.TipoItem;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public record ItemDTO(
        Long id,
        Long mesaId,
        String descricao,
        int quantidade,
        BigDecimal valorTotal,
        TipoItem tipo,
        Long participanteId,
        int vagasTotais,
        List<VagaDTO> vagas
) {
    public static ItemDTO fromDomain(ItemComanda item) {
        List<VagaDTO> vagasDTO = item.getVagas() != null
                ? item.getVagas().stream().map(VagaDTO::fromDomain).collect(Collectors.toList())
                : List.of();

        return new ItemDTO(
                item.getId(),
                item.getMesaId(),
                item.getDescricao(),
                item.getQuantidade(),
                item.getValorTotal(),
                item.getTipo(),
                item.getParticipanteId(),
                item.getVagasTotais(),
                vagasDTO
        );
    }
}
