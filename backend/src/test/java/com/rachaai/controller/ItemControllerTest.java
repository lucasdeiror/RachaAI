package com.rachaai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rachaai.domain.StatusVaga;
import com.rachaai.domain.TipoItem;
import com.rachaai.service.ItemService;
import com.rachaai.service.dto.AdicionarItemCommand;
import com.rachaai.service.dto.ItemDTO;
import com.rachaai.service.dto.VagaDTO;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ItemController.class)
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ItemService itemService;

    @Test
    @DisplayName("POST /api/mesas/{hash}/itens deve adicionar item e retornar 201 Created")
    void deveAdicionarItem() throws Exception {
        AdicionarItemCommand cmd = new AdicionarItemCommand("Chopp", 1, new BigDecimal("14.00"), TipoItem.INDIVIDUAL, 10L, 1);
        ItemDTO dto = new ItemDTO(1L, 100L, "Chopp", 1, new BigDecimal("14.00"), TipoItem.INDIVIDUAL, 10L, 1, List.of());

        when(itemService.adicionarItem(eq("ROL-1234"), any())).thenReturn(dto);

        mockMvc.perform(post("/api/mesas/ROL-1234/itens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cmd)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.descricao").value("Chopp"));
    }

    @Test
    @DisplayName("GET /api/mesas/{hash}/itens deve listar todos os itens da comanda")
    void deveListarItens() throws Exception {
        ItemDTO dto = new ItemDTO(1L, 100L, "Batata", 1, new BigDecimal("38.00"), TipoItem.COMPARTILHADO, null, 4, List.of());
        when(itemService.listarItensDaMesa("ROL-1234")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mesas/ROL-1234/itens"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descricao").value("Batata"))
                .andExpect(jsonPath("$[0].vagasTotais").value(4));
    }

    @Test
    @DisplayName("POST /api/mesas/{hash}/itens/{itemId}/vagas/{vagaId}/ocupar deve alocar vaga para participante")
    void deveOcuparVaga() throws Exception {
        VagaDTO vaga = new VagaDTO(10L, 5L, new BigDecimal("9.50"), StatusVaga.OCUPADA);
        when(itemService.ocuparVaga("ROL-1234", 1L, 10L, 5L)).thenReturn(vaga);

        mockMvc.perform(post("/api/mesas/ROL-1234/itens/1/vagas/10/ocupar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("participanteId", 5L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.participanteId").value(5L))
                .andExpect(jsonPath("$.status").value("OCUPADA"));
    }
}
