package com.rachaai.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class CalculadorRateio {

    public record CotaParticipante(
            Long participanteId,
            BigDecimal subtotalConsumo,
            BigDecimal valorTaxa,
            BigDecimal valorTotal
    ) {}

    public record RateioResultado(
            BigDecimal totalConsumo,
            BigDecimal totalTaxa,
            BigDecimal totalGeral,
            BigDecimal totalCoberto,
            BigDecimal saldoDescoberto,
            List<CotaParticipante> cotas
    ) {}

    public static RateioResultado calcular(Mesa mesa, List<ItemComanda> itens, List<Participante> participantes, Long hostParticipanteId) {
        if (mesa == null) {
            throw new IllegalArgumentException("Mesa é obrigatória.");
        }
        if (itens == null) itens = List.of();
        if (participantes == null) participantes = List.of();

        BigDecimal percentualTaxa = mesa.getTaxaServico() != null ? mesa.getTaxaServico() : new BigDecimal("10.00");
        BigDecimal fatorTaxa = percentualTaxa.divide(new BigDecimal("100"), 4, RoundingMode.HALF_EVEN);

        if (mesa.getModo() == ModoMesa.RACHA_FACIL) {
            return calcularRachaFacil(itens, participantes, fatorTaxa, hostParticipanteId);
        } else {
            return calcularComandaJusta(itens, participantes, fatorTaxa);
        }
    }

    private static RateioResultado calcularRachaFacil(List<ItemComanda> itens, List<Participante> participantes, BigDecimal fatorTaxa, Long hostParticipanteId) {
        BigDecimal totalConsumo = itens.stream()
                .map(ItemComanda::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);

        BigDecimal totalTaxa = totalConsumo.multiply(fatorTaxa).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal totalGeral = totalConsumo.add(totalTaxa).setScale(2, RoundingMode.HALF_EVEN);

        if (participantes.isEmpty()) {
            return new RateioResultado(totalConsumo, totalTaxa, totalGeral, BigDecimal.ZERO, totalGeral, List.of());
        }

        int qtd = participantes.size();
        BigDecimal cotaBase = totalGeral.divide(BigDecimal.valueOf(qtd), 2, RoundingMode.HALF_EVEN);
        BigDecimal somaCotas = cotaBase.multiply(BigDecimal.valueOf(qtd)).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal residuo = totalGeral.subtract(somaCotas).setScale(2, RoundingMode.HALF_EVEN);

        List<CotaParticipante> cotas = new ArrayList<>();
        for (int i = 0; i < qtd; i++) {
            Participante p = participantes.get(i);
            BigDecimal cotaPessoa = cotaBase;

            // Atribui o centavo residual ao host (ou ao primeiro participante se host não especificado)
            boolean isAlvoResiduo = (hostParticipanteId != null && Objects.equals(p.getId(), hostParticipanteId))
                    || (hostParticipanteId == null && i == 0);

            if (isAlvoResiduo) {
                cotaPessoa = cotaPessoa.add(residuo).setScale(2, RoundingMode.HALF_EVEN);
            }

            BigDecimal consumoIndividual = cotaPessoa.divide(BigDecimal.ONE.add(fatorTaxa), 2, RoundingMode.HALF_EVEN);
            BigDecimal taxaIndividual = cotaPessoa.subtract(consumoIndividual).setScale(2, RoundingMode.HALF_EVEN);

            cotas.add(new CotaParticipante(p.getId(), consumoIndividual, taxaIndividual, cotaPessoa));
        }

        return new RateioResultado(totalConsumo, totalTaxa, totalGeral, totalGeral, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN), cotas);
    }

    private static RateioResultado calcularComandaJusta(List<ItemComanda> itens, List<Participante> participantes, BigDecimal fatorTaxa) {
        BigDecimal totalConsumo = itens.stream()
                .map(ItemComanda::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);

        BigDecimal totalTaxa = totalConsumo.multiply(fatorTaxa).setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal totalGeral = totalConsumo.add(totalTaxa).setScale(2, RoundingMode.HALF_EVEN);

        Map<Long, BigDecimal> consumoPorParticipante = new HashMap<>();
        for (Participante p : participantes) {
            consumoPorParticipante.put(p.getId(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN));
        }

        BigDecimal valorItensAlocados = BigDecimal.ZERO;

        for (ItemComanda item : itens) {
            if (item.getTipo() == TipoItem.INDIVIDUAL) {
                if (item.getParticipanteId() != null && consumoPorParticipante.containsKey(item.getParticipanteId())) {
                    consumoPorParticipante.compute(item.getParticipanteId(), (k, v) -> (v != null ? v : BigDecimal.ZERO).add(item.getValorTotal()));
                    valorItensAlocados = valorItensAlocados.add(item.getValorTotal());
                }
            } else if (item.getTipo() == TipoItem.COMPARTILHADO) {
                for (VagaItem vaga : item.getVagas()) {
                    if (vaga.getStatus() == StatusVaga.OCUPADA && vaga.getParticipanteId() != null) {
                        if (consumoPorParticipante.containsKey(vaga.getParticipanteId())) {
                            consumoPorParticipante.compute(vaga.getParticipanteId(), (k, v) -> (v != null ? v : BigDecimal.ZERO).add(vaga.getValorVaga()));
                            valorItensAlocados = valorItensAlocados.add(vaga.getValorVaga());
                        }
                    }
                }
            }
        }

        List<CotaParticipante> cotas = new ArrayList<>();
        BigDecimal totalCoberto = BigDecimal.ZERO;

        for (Participante p : participantes) {
            BigDecimal subtotal = consumoPorParticipante.getOrDefault(p.getId(), BigDecimal.ZERO).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal taxa = subtotal.multiply(fatorTaxa).setScale(2, RoundingMode.HALF_EVEN);
            BigDecimal total = subtotal.add(taxa).setScale(2, RoundingMode.HALF_EVEN);

            cotas.add(new CotaParticipante(p.getId(), subtotal, taxa, total));
            totalCoberto = totalCoberto.add(total);
        }

        BigDecimal taxaDescoberta = totalTaxa.subtract(cotas.stream().map(CotaParticipante::valorTaxa).reduce(BigDecimal.ZERO, BigDecimal::add));
        BigDecimal saldoDescoberto = totalGeral.subtract(totalCoberto).setScale(2, RoundingMode.HALF_EVEN);

        return new RateioResultado(
                totalConsumo,
                totalTaxa,
                totalGeral,
                totalCoberto.setScale(2, RoundingMode.HALF_EVEN),
                saldoDescoberto.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_EVEN),
                cotas
        );
    }
}
