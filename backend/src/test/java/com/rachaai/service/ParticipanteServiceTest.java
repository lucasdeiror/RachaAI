package com.rachaai.service;

import com.rachaai.domain.*;
import com.rachaai.infra.repository.ItemComandaRepository;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.infra.repository.ParticipanteRepository;
import com.rachaai.service.dto.ParticipanteDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParticipanteServiceTest {

    @Mock
    private ParticipanteRepository participanteRepository;

    @Mock
    private MesaRepository mesaRepository;

    @Mock
    private ItemComandaRepository itemComandaRepository;

    @InjectMocks
    private ParticipanteService participanteService;

    @Test
    @DisplayName("Deve permitir entrada de novo participante sem cadastro prévio")
    void devePermitirEntradaConvidado() {
        Mesa mesa = new Mesa("ROL-1000", "Rolezão", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        when(participanteRepository.save(any(Participante.class))).thenAnswer(inv -> {
            Participante p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ParticipanteDTO dto = participanteService.entrarNaMesa("ROL-1000", "Danilo");

        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.nome()).isEqualTo("Danilo");
        assertThat(dto.statusQuitacao()).isEqualTo(StatusQuitacao.CONSUMINDO);
        assertThat(dto.tokenSessao()).isNotBlank();
        verify(participanteRepository).save(any(Participante.class));
    }

    @Test
    @DisplayName("Deve rejeitar entrada de participante se a mesa estiver FINALIZADA")
    void deveRejeitarEntradaEmMesaFinalizada() {
        Mesa mesa = new Mesa("ROL-1000", "Rolezão", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.finalizar();
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        assertThatThrownBy(() -> participanteService.entrarNaMesa("ROL-1000", "Danilo"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Mesa já foi finalizada");
    }

    @Test
    @DisplayName("Deve permitir que o participante declare que pagou via Pix")
    void deveDeclararPagamento() {
        Mesa mesa = new Mesa("ROL-1000", "Rolezão", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        Participante p = new Participante(1L, "Danilo");
        p.setId(10L);
        when(participanteRepository.findById(10L)).thenReturn(Optional.of(p));

        participanteService.declararPagamento("ROL-1000", 10L, p.getTokenSessao());

        assertThat(p.getStatusQuitacao()).isEqualTo(StatusQuitacao.DECLAROU_PAGO);
        verify(participanteRepository).save(p);
    }

    @Test
    @DisplayName("Deve permitir que o anfitrião confirme o pagamento com 1 toque")
    void deveConfirmarPagamentoPeloHost() {
        Mesa mesa = new Mesa("ROL-1000", "Rolezão", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        Participante p = new Participante(1L, "Danilo");
        p.setId(10L);
        p.declararPago();
        when(participanteRepository.findById(10L)).thenReturn(Optional.of(p));

        participanteService.confirmarPagamento("ROL-1000", 10L, mesa.getTokenHost());

        assertThat(p.getStatusQuitacao()).isEqualTo(StatusQuitacao.CONFIRMADO);
        verify(participanteRepository).save(p);
    }

    @Test
    @DisplayName("Deve recalcular o rateio de todos os participantes com exatidão")
    void deveRecalcularRateio() {
        Mesa mesa = new Mesa("ROL-1000", "Rolezão", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesa.setId(1L);
        when(mesaRepository.findByCodigoHash("ROL-1000")).thenReturn(Optional.of(mesa));

        Participante p = new Participante(1L, "Danilo");
        p.setId(10L);
        when(participanteRepository.findByMesaId(1L)).thenReturn(List.of(p));

        ItemComanda item = ItemComanda.criarIndividual(1L, "Chopp", 1, new BigDecimal("20.00"), 10L);
        when(itemComandaRepository.findByMesaId(1L)).thenReturn(List.of(item));

        participanteService.recalcularRateio("ROL-1000", null);

        assertThat(p.getValorConsumo()).isEqualByComparingTo("20.00");
        assertThat(p.getValorTaxa()).isEqualByComparingTo("2.00");
        assertThat(p.getValorFinal()).isEqualByComparingTo("22.00");
        verify(participanteRepository).save(p);
    }
}
