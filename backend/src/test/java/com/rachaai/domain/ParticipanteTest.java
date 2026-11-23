package com.rachaai.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ParticipanteTest {

    @Test
    @DisplayName("Deve criar participante com status CONSUMINDO e token de sessão")
    void deveCriarParticipante() {
        Participante p = new Participante(1L, "Danilo");

        assertThat(p.getMesaId()).isEqualTo(1L);
        assertThat(p.getNome()).isEqualTo("Danilo");
        assertThat(p.getTokenSessao()).isNotBlank();
        assertThat(p.getStatusQuitacao()).isEqualTo(StatusQuitacao.CONSUMINDO);
        assertThat(p.getValorConsumo()).isEqualByComparingTo("0.00");
        assertThat(p.getValorTaxa()).isEqualByComparingTo("0.00");
        assertThat(p.getValorFinal()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Deve rejeitar criação com nome em branco ou mesaId nulo")
    void deveRejeitarDadosInvalidos() {
        assertThatThrownBy(() -> new Participante(null, "Lucas"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mesa ID");

        assertThatThrownBy(() -> new Participante(1L, "   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Nome do participante");
    }

    @Test
    @DisplayName("Deve transitar status para DECLAROU_PAGO e CONFIRMADO")
    void deveGerenciarCicloDeQuitacao() {
        Participante p = new Participante(1L, "Lucas");

        p.declararPago();
        assertThat(p.getStatusQuitacao()).isEqualTo(StatusQuitacao.DECLAROU_PAGO);

        p.confirmarPagamento();
        assertThat(p.getStatusQuitacao()).isEqualTo(StatusQuitacao.CONFIRMADO);
    }

    @Test
    @DisplayName("Deve impedir declaração ou reabertura após confirmação pelo host")
    void deveImpedirAlteracaoAposConfirmado() {
        Participante p = new Participante(1L, "Lucas");
        p.confirmarPagamento();

        assertThatThrownBy(p::declararPago)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Pagamento já foi confirmado");

        assertThatThrownBy(p::reabrirConsumo)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Não é possível reabrir consumo");
    }

    @Test
    @DisplayName("Deve atualizar valores de consumo e taxa com precisão BigDecimal")
    void deveAtualizarValoresComPrecisao() {
        Participante p = new Participante(1L, "Lucas");
        p.atualizarValores(new BigDecimal("45.50"), new BigDecimal("4.55"));

        assertThat(p.getValorConsumo()).isEqualByComparingTo("45.50");
        assertThat(p.getValorTaxa()).isEqualByComparingTo("4.55");
        assertThat(p.getValorFinal()).isEqualByComparingTo("50.05");
    }
}
