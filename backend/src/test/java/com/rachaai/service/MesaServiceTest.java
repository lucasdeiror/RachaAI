package com.rachaai.service;

import com.rachaai.domain.Mesa;
import com.rachaai.domain.ModoMesa;
import com.rachaai.domain.StatusMesa;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.service.dto.CriarMesaCommand;
import com.rachaai.service.dto.MesaDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MesaServiceTest {

    @Mock
    private MesaRepository mesaRepository;

    @InjectMocks
    private MesaService mesaService;

    @Test
    @DisplayName("Deve criar nova mesa com hash e token do anfitrião")
    void deveCriarMesa() {
        CriarMesaCommand cmd = new CriarMesaCommand("Rolezinho", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));

        when(mesaRepository.findByCodigoHash(any())).thenReturn(Optional.empty());
        when(mesaRepository.save(any(Mesa.class))).thenAnswer(invocation -> {
            Mesa m = invocation.getArgument(0);
            m.setId(1L);
            return m;
        });

        MesaDTO dto = mesaService.criarMesa(cmd);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.nomeRole()).isEqualTo("Rolezinho");
        assertThat(dto.tokenHost()).isNotBlank();
        assertThat(dto.status()).isEqualTo(StatusMesa.ABERTA);
        verify(mesaRepository).save(any(Mesa.class));
    }

    @Test
    @DisplayName("Deve buscar mesa por hash ocultando o token do anfitrião para a visão pública")
    void deveBuscarPorHashPublico() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        when(mesaRepository.findByCodigoHash("ROL-1234")).thenReturn(Optional.of(mesa));

        MesaDTO dto = mesaService.buscarPorHash("ROL-1234");

        assertThat(dto.codigoHash()).isEqualTo("ROL-1234");
        assertThat(dto.tokenHost()).isNull();
    }

    @Test
    @DisplayName("Deve lançar NoSuchElementException ao buscar hash inexistente")
    void deveLancarExcecaoHashInexistente() {
        when(mesaRepository.findByCodigoHash("ROL-0000")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mesaService.buscarPorHash("ROL-0000"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Mesa não encontrada");
    }

    @Test
    @DisplayName("Deve travar mesa com token válido do anfitrião")
    void deveTravarMesaComSucesso() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        when(mesaRepository.findByCodigoHash("ROL-1234")).thenReturn(Optional.of(mesa));

        mesaService.travarMesa("ROL-1234", mesa.getTokenHost());

        assertThat(mesa.getStatus()).isEqualTo(StatusMesa.TRAVADA);
        verify(mesaRepository).save(mesa);
    }

    @Test
    @DisplayName("Deve rejeitar trava de mesa se o token do anfitrião for inválido")
    void deveRejeitarTravaComTokenInvalido() {
        Mesa mesa = new Mesa("ROL-1234", "Bar do Zé", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        when(mesaRepository.findByCodigoHash("ROL-1234")).thenReturn(Optional.of(mesa));

        assertThatThrownBy(() -> mesaService.travarMesa("ROL-1234", "token-invasor"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Acesso negado");
    }
}
