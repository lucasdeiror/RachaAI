package com.rachaai.service;

import com.rachaai.domain.*;
import com.rachaai.infra.repository.ItemComandaRepository;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.infra.repository.VagaItemRepository;
import com.rachaai.service.dto.AdicionarItemCommand;
import com.rachaai.service.dto.ItemDTO;
import com.rachaai.service.dto.VagaDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemComandaRepository itemComandaRepository;

    @Mock
    private VagaItemRepository vagaItemRepository;

    @Mock
    private MesaRepository mesaRepository;

    @InjectMocks
    private ItemService itemService;

    @Test
    @DisplayName("Deve adicionar item individual à comanda com sucesso")
    void deveAdicionarItemIndividual() {
        Mesa mesa = new Mesa("ROL-1000", "Barzin", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        AdicionarItemCommand cmd = new AdicionarItemCommand("Chopp Pilsen", 2, new BigDecimal("24.00"), TipoItem.INDIVIDUAL, 10L, 1);

        when(itemComandaRepository.save(any(ItemComanda.class))).thenAnswer(inv -> {
            ItemComanda i = inv.getArgument(0);
            i.setId(100L);
            return i;
        });

        ItemDTO dto = itemService.adicionarItem("ROL-1000", cmd);

        assertThat(dto.id()).isEqualTo(100L);
        assertThat(dto.descricao()).isEqualTo("Chopp Pilsen");
        assertThat(dto.tipo()).isEqualTo(TipoItem.INDIVIDUAL);
        assertThat(dto.valorTotal()).isEqualByComparingTo("24.00");
    }

    @Test
    @DisplayName("Deve adicionar item compartilhado com N vagas unitárias fixas")
    void deveAdicionarItemCompartilhado() {
        Mesa mesa = new Mesa("ROL-1000", "Barzin", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        AdicionarItemCommand cmd = new AdicionarItemCommand("Tábua de Frios", 1, new BigDecimal("50.00"), TipoItem.COMPARTILHADO, null, 5);

        when(itemComandaRepository.save(any(ItemComanda.class))).thenAnswer(inv -> {
            ItemComanda i = inv.getArgument(0);
            i.setId(200L);
            return i;
        });

        ItemDTO dto = itemService.adicionarItem("ROL-1000", cmd);

        assertThat(dto.id()).isEqualTo(200L);
        assertThat(dto.tipo()).isEqualTo(TipoItem.COMPARTILHADO);
        assertThat(dto.vagasTotais()).isEqualTo(5);
        assertThat(dto.vagas()).hasSize(5);
        assertThat(dto.vagas().get(0).valorVaga()).isEqualByComparingTo("10.00");
    }

    @Test
    @DisplayName("Deve impedir adição de itens quando a mesa estiver travada")
    void deveImpedirAdicaoEmMesaTravada() {
        Mesa mesa = new Mesa("ROL-1000", "Barzin", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.travar();
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        AdicionarItemCommand cmd = new AdicionarItemCommand("Chopp", 1, new BigDecimal("12.00"), TipoItem.INDIVIDUAL, 10L, 1);

        assertThatThrownBy(() -> itemService.adicionarItem("ROL-1000", cmd))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não está aberta para edições");
    }

    @Test
    @DisplayName("Deve ocupar vaga atomicamente com sucesso")
    void deveOcuparVagaAtomicamente() {
        Mesa mesa = new Mesa("ROL-1000", "Barzin", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        when(vagaItemRepository.ocuparVagaAtomicamente(eq(50L), eq(10L), any(Instant.class))).thenReturn(1);

        VagaItem vagaAtualizada = new VagaItem(null, new BigDecimal("15.00"));
        vagaAtualizada.setId(50L);
        vagaAtualizada.ocupar(10L);
        when(vagaItemRepository.findById(50L)).thenReturn(Optional.of(vagaAtualizada));

        VagaDTO vagaDTO = itemService.ocuparVaga("ROL-1000", 200L, 50L, 10L);

        assertThat(vagaDTO.id()).isEqualTo(50L);
        assertThat(vagaDTO.participanteId()).isEqualTo(10L);
        assertThat(vagaDTO.status()).isEqualTo(StatusVaga.OCUPADA);
    }

    @Test
    @DisplayName("Deve falhar ao ocupar vaga se concorrência já tiver ocupado (0 linhas afetadas)")
    void deveFalharOcupacaoConcorrente() {
        Mesa mesa = new Mesa("ROL-1000", "Barzin", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        when(vagaItemRepository.ocuparVagaAtomicamente(eq(50L), eq(10L), any(Instant.class))).thenReturn(0);

        assertThatThrownBy(() -> itemService.ocuparVaga("ROL-1000", 200L, 50L, 10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Vaga indisponível ou já ocupada");
    }
}
