package com.rachaai.controller;

import com.rachaai.domain.Mesa;
import com.rachaai.domain.ModoMesa;
import com.rachaai.domain.Participante;
import com.rachaai.infra.repository.ParticipanteRepository;
import com.rachaai.service.MesaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PixController.class)
class PixControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MesaService mesaService;

    @MockBean
    private ParticipanteRepository participanteRepository;

    @Test
    @DisplayName("GET /api/mesas/{hash}/pix deve gerar payload EMV para participante")
    void deveGerarPayloadPixParticipante() throws Exception {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaService.buscarEntidadePorHash("ROL-1234")).thenReturn(mesa);

        Participante p = new Participante(1L, "Danilo");
        p.setId(10L);
        p.atualizarValores(new BigDecimal("30.00"), new BigDecimal("3.00")); // final 33.00
        when(participanteRepository.findById(10L)).thenReturn(Optional.of(p));

        mockMvc.perform(get("/api/mesas/ROL-1234/pix?participanteId=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chavePix").value("host@pix.com"))
                .andExpect(jsonPath("$.valor").value(33.00))
                .andExpect(jsonPath("$.txId").value("ROL-1234"))
                .andExpect(jsonPath("$.payloadBrCode").value(org.hamcrest.Matchers.startsWith("000201")));
    }
}
