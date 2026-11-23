package com.rachaai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rachaai.domain.StatusQuitacao;
import com.rachaai.service.ParticipanteService;
import com.rachaai.service.dto.ParticipanteDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ParticipanteController.class)
class ParticipanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ParticipanteService participanteService;

    @Test
    @DisplayName("POST /api/mesas/{hash}/participantes deve registrar participante e retornar 201 Created")
    void deveRegistrarParticipante() throws Exception {
        ParticipanteDTO dto = new ParticipanteDTO(10L, 1L, "Danilo", "tok-sessao", StatusQuitacao.CONSUMINDO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        when(participanteService.entrarNaMesa("ROL-1234", "Danilo")).thenReturn(dto);

        mockMvc.perform(post("/api/mesas/ROL-1234/participantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Danilo"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.nome").value("Danilo"))
                .andExpect(jsonPath("$.tokenSessao").value("tok-sessao"));
    }

    @Test
    @DisplayName("GET /api/mesas/{hash}/participantes deve retornar lista do radar social")
    void deveListarParticipantes() throws Exception {
        ParticipanteDTO dto = new ParticipanteDTO(10L, 1L, "Danilo", null, StatusQuitacao.CONSUMINDO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        when(participanteService.listarParticipantes("ROL-1234")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mesas/ROL-1234/participantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Danilo"));
    }

    @Test
    @DisplayName("POST /api/mesas/{hash}/participantes/{id}/declarar-pago deve acionar serviço com 200 OK")
    void deveDeclararPago() throws Exception {
        mockMvc.perform(post("/api/mesas/ROL-1234/participantes/10/declarar-pago")
                        .header("X-Session-Token", "tok-sessao"))
                .andExpect(status().isOk());

        verify(participanteService).declararPagamento("ROL-1234", 10L, "tok-sessao");
    }

    @Test
    @DisplayName("POST /api/mesas/{hash}/participantes/{id}/confirmar deve permitir confirmação pelo anfitrião")
    void deveConfirmarPagamentoHost() throws Exception {
        mockMvc.perform(post("/api/mesas/ROL-1234/participantes/10/confirmar")
                        .header("X-Host-Token", "host-token-123"))
                .andExpect(status().isOk());

        verify(participanteService).confirmarPagamento("ROL-1234", 10L, "host-token-123");
    }
}
