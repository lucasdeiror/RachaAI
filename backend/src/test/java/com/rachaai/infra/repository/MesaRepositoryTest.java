package com.rachaai.infra.repository;

import com.rachaai.domain.Mesa;
import com.rachaai.domain.ModoMesa;
import com.rachaai.domain.StatusMesa;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MesaRepositoryTest {

    @Autowired
    private MesaRepository mesaRepository;

    @Test
    @DisplayName("Deve salvar mesa e recuperar por hash único")
    void deveSalvarERecuperarPorHash() {
        Mesa mesa = new Mesa("ROL-9999", "Choppada", "host@pix.com", "Lucas", ModoMesa.COMANDA_JUSTA, new BigDecimal("10.00"));
        mesaRepository.save(mesa);

        Optional<Mesa> opt = mesaRepository.findByCodigoHash("ROL-9999");
        assertThat(opt).isPresent();
        assertThat(opt.get().getNomeRole()).isEqualTo("Choppada");
        assertThat(opt.get().getStatus()).isEqualTo(StatusMesa.ABERTA);
    }

    @Test
    @DisplayName("Deve buscar mesa por hash e token do host")
    void deveBuscarPorHashETokenHost() {
        Mesa mesa = new Mesa("ROL-8888", "Barzin", "host@pix.com", "Lucas", ModoMesa.RACHA_FACIL, new BigDecimal("10.00"));
        mesaRepository.save(mesa);

        Optional<Mesa> opt = mesaRepository.findByCodigoHashAndTokenHost("ROL-8888", mesa.getTokenHost());
        assertThat(opt).isPresent();

        Optional<Mesa> invalido = mesaRepository.findByCodigoHashAndTokenHost("ROL-8888", "token-invalido");
        assertThat(invalido).isEmpty();
    }
}
