package com.rachaai.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ItemComandaTest {

    @Test
    @DisplayName("Deve criar item individual com sucesso")
    void deveCriarItemIndividual() {
        ItemComanda item = ItemComanda.criarIndividual(1L, "Chopp IPA", 2, new BigDecimal("28.00"), 10L);

        assertThat(item.getMesaId()).isEqualTo(1L);
        assertThat(item.getDescricao()).isEqualTo("Chopp IPA");
        assertThat(item.getQuantidade()).isEqualTo(2);
        assertThat(item.getValorTotal()).isEqualByComparingTo("28.00");
        assertThat(item.getTipo()).isEqualTo(TipoItem.INDIVIDUAL);
        assertThat(item.getParticipanteId()).isEqualTo(10L);
        assertThat(item.getVagasTotais()).isEqualTo(1);
        assertThat(item.getVagas()).isEmpty();
    }

    @Test
    @DisplayName("Deve criar item compartilhado com N vagas e valor unitário fixo (AD-016)")
    void deveCriarItemCompartilhadoComNVagas() {
        // R$ 38,00 dividido em 4 vagas = R$ 9,50 por vaga
        ItemComanda item = ItemComanda.criarCompartilhado(1L, "Batata Frita Suprema", 1, new BigDecimal("38.00"), 4);

        assertThat(item.getTipo()).isEqualTo(TipoItem.COMPARTILHADO);
        assertThat(item.getVagasTotais()).isEqualTo(4);
        assertThat(item.getVagas()).hasSize(4);

        for (VagaItem vaga : item.getVagas()) {
            assertThat(vaga.getStatus()).isEqualTo(StatusVaga.ABERTA);
            assertThat(vaga.getParticipanteId()).isNull();
            assertThat(vaga.getValorVaga()).isEqualByComparingTo("9.50");
        }

        assertThat(item.getVagasAbertas()).hasSize(4);
        assertThat(item.getVagasOcupadas()).isEmpty();
    }

    @Test
    @DisplayName("Deve ocupar vaga disponível e refletir no status")
    void deveOcuparVagaDisponivel() {
        ItemComanda item = ItemComanda.criarCompartilhado(1L, "Pizza Grande", 1, new BigDecimal("60.00"), 3);

        item.ocuparPrimeiraVagaDisponivel(101L);

        assertThat(item.getVagasAbertas()).hasSize(2);
        assertThat(item.getVagasOcupadas()).hasSize(1);
        assertThat(item.getVagasOcupadasPor(101L)).hasSize(1);
    }

    @Test
    @DisplayName("Deve desocupar vaga e permitir reabertura sem afetar outras vagas")
    void deveDesocuparVaga() {
        ItemComanda item = ItemComanda.criarCompartilhado(1L, "Pizza Grande", 1, new BigDecimal("60.00"), 2);
        item.getVagas().get(0).setId(1L);
        item.getVagas().get(1).setId(2L);

        item.ocuparVaga(1L, 101L);
        assertThat(item.getVagasAbertas()).hasSize(1);

        item.desocuparVaga(1L, 101L);
        assertThat(item.getVagasAbertas()).hasSize(2);
        assertThat(item.getVagas().get(0).getStatus()).isEqualTo(StatusVaga.ABERTA);
        assertThat(item.getVagas().get(0).getParticipanteId()).isNull();
    }

    @Test
    @DisplayName("Deve rejeitar desocupação de vaga por outro participante que não o dono")
    void deveRejeitarDesocupacaoPorOutroParticipante() {
        ItemComanda item = ItemComanda.criarCompartilhado(1L, "Pizza Grande", 1, new BigDecimal("60.00"), 2);
        item.getVagas().get(0).setId(1L);

        item.ocuparVaga(1L, 101L);

        assertThatThrownBy(() -> item.desocuparVaga(1L, 999L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Apenas o participante ocupante pode liberar a vaga");
    }

    @Test
    @DisplayName("Deve impedir operações de vaga em item individual")
    void deveImpedirVagasEmItemIndividual() {
        ItemComanda item = ItemComanda.criarIndividual(1L, "Refrigerante", 1, new BigDecimal("8.00"), 10L);

        assertThatThrownBy(() -> item.ocuparPrimeiraVagaDisponivel(10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Apenas itens compartilhados possuem vagas");
    }
}
