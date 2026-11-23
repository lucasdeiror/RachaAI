package com.rachaai.service;

import com.rachaai.domain.Mesa;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.service.dto.CriarMesaCommand;
import com.rachaai.service.dto.MesaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.NoSuchElementException;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;
    private final SecureRandom random = new SecureRandom();

    public MesaService(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @Transactional
    public MesaDTO criarMesa(CriarMesaCommand cmd) {
        String hash = gerarHashUnico();
        Mesa mesa = new Mesa(
                hash,
                cmd.nomeRole(),
                cmd.chavePixHost(),
                cmd.nomeHost(),
                cmd.modo(),
                cmd.taxaServico()
        );
        Mesa salvo = mesaRepository.save(mesa);
        return MesaDTO.fromDomain(salvo, true);
    }

    @Transactional(readOnly = true)
    public MesaDTO buscarPorHash(String hash) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        return MesaDTO.fromDomain(mesa, false);
    }

    @Transactional(readOnly = true)
    public Mesa buscarEntidadePorHash(String hash) {
        return mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
    }

    @Transactional
    public void travarMesa(String hash, String hostToken) {
        Mesa mesa = buscarEntidadePorHash(hash);
        validarHostToken(mesa, hostToken);
        mesa.travar();
        mesaRepository.save(mesa);
    }

    @Transactional
    public void finalizarMesa(String hash, String hostToken) {
        Mesa mesa = buscarEntidadePorHash(hash);
        validarHostToken(mesa, hostToken);
        mesa.finalizar();
        mesaRepository.save(mesa);
    }

    private void validarHostToken(Mesa mesa, String hostToken) {
        if (!mesa.isHost(hostToken)) {
            throw new SecurityException("Acesso negado: token do anfitrião inválido.");
        }
    }

    private String gerarHashUnico() {
        for (int i = 0; i < 10; i++) {
            int num = 1000 + random.nextInt(9000);
            String candidato = "ROL-" + num;
            if (mesaRepository.findByCodigoHash(candidato).isEmpty()) {
                return candidato;
            }
        }
        return "ROL-" + System.currentTimeMillis() % 100000;
    }
}
