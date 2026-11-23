package com.rachaai.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MesaTest {

    @Test
    @DisplayName("Deve criar mesa com dados válidos e status ABERTA")
    void deveCriarMesaComSucesso() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "contato@bar.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));

        assertThat(mesa.getCodigoHash()).isEqualTo("ROL-1234");
        assertThat(mesa.getNomeRole()).isEqualTo("Bar do Zé");
        assertThat(mesa.getChavePixHost()).isEqualTo("contato@bar.com");
        assertThat(mesa.getNomeHost()).isEqualTo("Lucas");
        assertThat(mesa.getStatus()).isEqualTo(StatusMesa.ABERTA);
        assertThat(mesa.getModo()).isEqualTo(ModoMesa.COMANDA_JUSTA);
        assertThat(mesa.getTaxaServico()).isEqualByComparingTo("10.00");
        assertThat(mesa.getTokenHost()).isNotBlank();
        assertThat(mesa.getCriadoEm()).isNotNull();
        assertThat(mesa.getExpiraEm()).isNotNull();
    }

    @Test
    @DisplayName("Deve permitir criação de mesa sem nome do rolê, assumindo 'Mesa' por padrão")
    void devePermitirCriacaoSemNomeRole() {
        Mesa mesa = new Mesa("ROL-1234", "", "pix@teste.com", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN);
        assertThat(mesa.getNomeRole()).isEqualTo("Mesa");

        Mesa mesaNull = new Mesa("ROL-1234", null, "pix@teste.com", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN);
        assertThat(mesaNull.getNomeRole()).isEqualTo("Mesa");
    }

    @Test
    @DisplayName("Deve rejeitar criação de mesa com dados obrigatórios em branco")
    void deveRejeitarCamposObrigatoriosEmBranco() {
        assertThatThrownBy(() -> new Mesa("ROL-1234", "Rolê", "", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Chave Pix");

        assertThatThrownBy(() -> new Mesa("ROL-1234", "Rolê", "pix@teste.com", " ", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Nome do anfitrião");
    }

    @Test
    @DisplayName("Deve travar mesa e impedir edições posteriores")
    void deveTravarMesaEImpedirEdicoes() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "pix@teste.com", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN);

        mesa.validarEditavel(); // não deve lançar exceção quando ABERTA

        mesa.travar();
        assertThat(mesa.getStatus()).isEqualTo(StatusMesa.TRAVADA);

        assertThatThrownBy(mesa::validarEditavel)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não está aberta para edições");
    }

    @Test
    @DisplayName("Deve impedir travar mesa que já não esteja ABERTA")
    void deveImpedirTravarMesaJaTravada() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "pix@teste.com", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN);
        mesa.travar();

        assertThatThrownBy(mesa::travar)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Apenas mesas ABERTAS podem ser travadas");
    }

    @Test
    @DisplayName("Deve validar corretamente o token do anfitrião")
    void deveValidarTokenHost() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "pix@teste.com", "Lucas", ModoMesa.COMANDA_JUSTA, BigDecimal.TEN);

        assertThat(mesa.isHost(mesa.getTokenHost())).isTrue();
        assertThat(mesa.isHost("token-falso")).isFalse();
        assertThat(mesa.isHost(null)).isFalse();
    }
}
