package com.rachaai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rachaai.domain.ModoMesa;
import com.rachaai.domain.StatusMesa;
import com.rachaai.service.MesaService;
import com.rachaai.service.dto.CriarMesaCommand;
import com.rachaai.service.dto.MesaDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MesaController.class)
class MesaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MesaService mesaService;

    @Test
    @DisplayName("POST /api/mesas deve criar mesa e retornar 201 Created")
    void deveCriarMesa() throws Exception {
        CriarMesaCommand cmd = new CriarMesaCommand("Rolezinho", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        MesaDTO dto = new MesaDTO(1L, "ROL-1234", "Rolezinho", "host@pix.com", "Lucas", "tok123", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"), StatusMesa.ABERTA, Instant.now(), Instant.now());

        when(mesaService.criarMesa(any())).thenReturn(dto);

        mockMvc.perform(post("/api/mesas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigoHash").value("ROL-1234"))
                .andExpect(jsonPath("$.tokenHost").value("tok123"));
    }

    @Test
    @DisplayName("GET /api/mesas/{hash} deve retornar 200 OK")
    void deveBuscarMesa() throws Exception {
        MesaDTO dto = new MesaDTO(1L, "ROL-1234", "Rolezinho", "host@pix.com", "Lucas", null, ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"), StatusMesa.ABERTA, Instant.now(), Instant.now());
        when(mesaService.buscarPorHash("ROL-1234")).thenReturn(dto);

        mockMvc.perform(get("/api/mesas/ROL-1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoHash").value("ROL-1234"))
                .andExpect(jsonPath("$.tokenHost").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/mesas/{hash} inexistente deve retornar 404 Not Found")
    void deveRetornar404ParaHashInexistente() throws Exception {
        when(mesaService.buscarPorHash("ROL-0000")).thenThrow(new NoSuchElementException("Mesa não encontrada"));

        mockMvc.perform(get("/api/mesas/ROL-0000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Mesa não encontrada"));
    }

    @Test
    @DisplayName("POST /api/mesas/{hash}/travar sem token de host válido deve retornar 403 Forbidden")
    void deveRetornar403TravarTokenInvalido() throws Exception {
        doThrow(new SecurityException("Acesso negado: token do anfitrião inválido."))
                .when(mesaService).travarMesa(eq("ROL-1234"), eq("token-errado"));

        mockMvc.perform(post("/api/mesas/ROL-1234/travar")
                        .header("X-Host-Token", "token-errado"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("Acesso negado: token do anfitrião inválido."));
    }
}
