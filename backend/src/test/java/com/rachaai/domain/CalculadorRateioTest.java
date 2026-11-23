package com.rachaai.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CalculadorRateioTest {

    @Test
    @DisplayName("Racha Fácil: Deve ratear conta igualmente e resolver resíduo de centavos no anfitrião")
    void deveRatearRachaFacilComResiduoNoHost() {
        Mesa mesa = new Mesa("ROL-1000", "Bar Amigos", "pix@bar.com", "Lucas", ModoMesa.RACHA_FACIL, new BigDecimal("10.00"));

        ItemComanda item1 = ItemComanda.criarIndividual(1L, "Conta Geral", 1, new BigDecimal("100.00"), null);

        Participante p1 = new Participante(1L, "Lucas"); // host
        p1.setId(1L);
        Participante p2 = new Participante(1L, "Danilo");
        p2.setId(2L);
        Participante p3 = new Participante(1L, "Gabi");
        p3.setId(3L);

        CalculadorRateio.RateioResultado res = CalculadorRateio.calcular(
                mesa,
                List.of(item1),
                List.of(p1, p2, p3),
                1L // host ID
        );

        // Total consumo: 100.00, Taxa 10%: 10.00, Total Geral: 110.00
        assertThat(res.totalConsumo()).isEqualByComparingTo("100.00");
        assertThat(res.totalTaxa()).isEqualByComparingTo("10.00");
        assertThat(res.totalGeral()).isEqualByComparingTo("110.00");
        assertThat(res.saldoDescoberto()).isEqualByComparingTo("0.00");

        // Soma exata das cotas deve ser rigorosamente 110.00
        BigDecimal somaCotas = res.cotas().stream()
                .map(CalculadorRateio.CotaParticipante::valorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(somaCotas).isEqualByComparingTo("110.00");

        // 110 / 3 = 36.67. 36.67 * 3 = 110.01. Residuo = -0.01 aplicado no host (36.66). Outros 2 pagam 36.67.
        CalculadorRateio.CotaParticipante cotaHost = res.cotas().stream()
                .filter(c -> c.participanteId().equals(1L))
                .findFirst()
                .orElseThrow();

        assertThat(cotaHost.valorTotal()).isEqualByComparingTo("36.66");
    }

    @Test
    @DisplayName("Comanda Justa: Deve calcular consumo individual + vagas ocupadas + taxa percentual")
    void deveCalcularComandaJustaComVagasOcupadas() {
        Mesa mesa = new Mesa("ROL-2000", "Petiscaria", "pix@bar.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));

        Participante p1 = new Participante(1L, "Lucas");
        p1.setId(1L);
        Participante p2 = new Participante(1L, "Danilo");
        p2.setId(2L);

        // Lucas: 1 Chopp R$ 15,00
        ItemComanda itemLucas = ItemComanda.criarIndividual(1L, "Chopp", 1, new BigDecimal("15.00"), 1L);

        // Danilo: 1 Hambúrguer R$ 35,00
        ItemComanda itemDanilo = ItemComanda.criarIndividual(1L, "Burger", 1, new BigDecimal("35.00"), 2L);

        // Compartilhado: Porção de Camarão R$ 50,00 dividida em 2 vagas (R$ 25,00 cada)
        ItemComanda porcao = ItemComanda.criarCompartilhado(1L, "Camarão", 1, new BigDecimal("50.00"), 2);
        porcao.getVagas().get(0).setId(10L);
        porcao.getVagas().get(1).setId(11L);
        porcao.ocuparVaga(10L, 1L); // Lucas pegou vaga 1
        porcao.ocuparVaga(11L, 2L); // Danilo pegou vaga 2

        CalculadorRateio.RateioResultado res = CalculadorRateio.calcular(
                mesa,
                List.of(itemLucas, itemDanilo, porcao),
                List.of(p1, p2),
                1L
        );

        // Total Consumo: 15 + 35 + 50 = 100.00
        // Total Taxa (10%): 10.00
        // Total Geral: 110.00
        assertThat(res.totalConsumo()).isEqualByComparingTo("100.00");
        assertThat(res.totalTaxa()).isEqualByComparingTo("10.00");
        assertThat(res.totalGeral()).isEqualByComparingTo("110.00");
        assertThat(res.saldoDescoberto()).isEqualByComparingTo("0.00");

        // Lucas: 15 + 25 = 40. Taxa 10% = 4.00. Total = 44.00
        CalculadorRateio.CotaParticipante cotaLucas = res.cotas().stream()
                .filter(c -> c.participanteId().equals(1L)).findFirst().orElseThrow();
        assertThat(cotaLucas.subtotalConsumo()).isEqualByComparingTo("40.00");
        assertThat(cotaLucas.valorTaxa()).isEqualByComparingTo("4.00");
        assertThat(cotaLucas.valorTotal()).isEqualByComparingTo("44.00");

        // Danilo: 35 + 25 = 60. Taxa 10% = 6.00. Total = 66.00
        CalculadorRateio.CotaParticipante cotaDanilo = res.cotas().stream()
                .filter(c -> c.participanteId().equals(2L)).findFirst().orElseThrow();
        assertThat(cotaDanilo.subtotalConsumo()).isEqualByComparingTo("60.00");
        assertThat(cotaDanilo.valorTaxa()).isEqualByComparingTo("6.00");
        assertThat(cotaDanilo.valorTotal()).isEqualByComparingTo("66.00");

        assertThat(cotaLucas.valorTotal().add(cotaDanilo.valorTotal())).isEqualByComparingTo("110.00");
    }

    @Test
    @DisplayName("Comanda Justa: Deve identificar saldo descoberto quando restam vagas abertas")
    void deveIdentificarSaldoDescobertoEmVagasAbertas() {
        Mesa mesa = new Mesa("ROL-3000", "Petiscaria", "pix@bar.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));

        Participante p1 = new Participante(1L, "Lucas");
        p1.setId(1L);

        // Item compartilhado R$ 40,00 com 4 vagas (R$ 10,00 cada). Lucas ocupa apenas 1 vaga.
        ItemComanda porcao = ItemComanda.criarCompartilhado(1L, "Batata", 1, new BigDecimal("40.00"), 4);
        porcao.getVagas().get(0).setId(1L);
        porcao.ocuparVaga(1L, 1L);

        CalculadorRateio.RateioResultado res = CalculadorRateio.calcular(
                mesa,
                List.of(porcao),
                List.of(p1),
                1L
        );

        // Lucas paga 10.00 + 1.00 taxa = 11.00
        // Total da mesa: 40.00 + 4.00 taxa = 44.00
        // Saldo descoberto (3 vagas abertas = 30.00 + 3.00 taxa) = 33.00
        assertThat(res.totalGeral()).isEqualByComparingTo("44.00");
        assertThat(res.totalCoberto()).isEqualByComparingTo("11.00");
        assertThat(res.saldoDescoberto()).isEqualByComparingTo("33.00");
    }
}
