package com.rachaai.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PixEmvPayloadGeneratorTest {

    @Test
    @DisplayName("Deve gerar payload Pix EMV BR Code em conformidade com padrão Bacen")
    void deveGerarPayloadValido() {
        String payload = PixEmvPayloadGenerator.gerarPayload(
                "lucas@rachaai.com",
                "Lucas Deiró",
                "São Paulo",
                new BigDecimal("45.50"),
                "ROL1234"
        );

        // Deve iniciar com Payload Format Indicator 000201
        assertThat(payload).startsWith("000201");

        // Deve conter GUI do Pix do Banco Central
        assertThat(payload).contains("br.gov.bcb.pix");

        // Deve conter a chave Pix
        assertThat(payload).contains("lucas@rachaai.com");

        // Moeda Real 986
        assertThat(payload).contains("5303986");

        // Valor formatado
        assertThat(payload).contains("540545.50");

        // País BR
        assertThat(payload).contains("5802BR");

        // Nome sem acentos normalizado
        assertThat(payload).contains("5911Lucas Deiro");

        // Cidade sem acentos normalizada
        assertThat(payload).contains("6009SAO PAULO");

        // TxID da mesa
        assertThat(payload).contains("62110507ROL1234");

        // Deve terminar com 6304 seguido do CRC de 4 caracteres hexadecimais
        assertThat(payload).matches(".*6304[0-9A-F]{4}$");

        // Validação determinística do CRC
        String parteSemCrc = payload.substring(0, payload.length() - 4);
        String crcCalculado = PixEmvPayloadGenerator.calcularCRC16(parteSemCrc);
        String crcPresente = payload.substring(payload.length() - 4);
        assertThat(crcPresente).isEqualTo(crcCalculado);
    }

    @Test
    @DisplayName("Deve rejeitar chave Pix nula ou vazia")
    void deveRejeitarChavePixInvalida() {
        assertThatThrownBy(() -> PixEmvPayloadGenerator.gerarPayload(
                " ",
                "Lucas",
                "Aracaju",
                BigDecimal.TEN,
                "ROL1000"
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Chave Pix é obrigatória");
    }

    @Test
    @DisplayName("Deve truncar nomes longos respeitando os limites da norma EMV")
    void deveTruncarNomesLongos() {
        String nomeGigante = "Nome Muito Longo Que Ultrapassa Vinte E Cinco Caracteres";
        String payload = PixEmvPayloadGenerator.gerarPayload(
                "chave@pix.com",
                nomeGigante,
                "Cidade Muito Longa",
                new BigDecimal("10.00"),
                "TXID"
        );

        assertThat(payload).contains("5925Nome Muito Longo Que Ultr");
        assertThat(payload).contains("6015CIDADE MUITO LO");
    }
}
