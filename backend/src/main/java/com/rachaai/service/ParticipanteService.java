package com.rachaai.service;

import com.rachaai.domain.*;
import com.rachaai.infra.repository.ItemComandaRepository;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.infra.repository.ParticipanteRepository;
import com.rachaai.service.dto.ParticipanteDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ParticipanteService {

    private final ParticipanteRepository participanteRepository;
    private final MesaRepository mesaRepository;
    private final ItemComandaRepository itemComandaRepository;

    public ParticipanteService(ParticipanteRepository participanteRepository,
                               MesaRepository mesaRepository,
                               ItemComandaRepository itemComandaRepository) {
        this.participanteRepository = participanteRepository;
        this.mesaRepository = mesaRepository;
        this.itemComandaRepository = itemComandaRepository;
    }

    @Transactional
    public ParticipanteDTO entrarNaMesa(String hash, String nome) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));

        if (mesa.getStatus() == StatusMesa.FINALIZADA) {
            throw new IllegalStateException("Mesa já foi finalizada. Não é possível entrar.");
        }

        Participante participante = new Participante(mesa.getId(), nome);
        Participante salvo = participanteRepository.save(participante);
        return ParticipanteDTO.fromDomain(salvo, true);
    }

    @Transactional(readOnly = true)
    public List<ParticipanteDTO> listarParticipantes(String hash) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        return participanteRepository.findByMesaId(mesa.getId())
                .stream()
                .map(p -> ParticipanteDTO.fromDomain(p, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public void declararPagamento(String hash, Long participanteId, String tokenSessao) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));

        Participante participante = participanteRepository.findById(participanteId)
                .orElseThrow(() -> new NoSuchElementException("Participante não encontrado: " + participanteId));

        if (!Objects.equals(participante.getMesaId(), mesa.getId())) {
            throw new IllegalArgumentException("Participante não pertence a esta mesa.");
        }

        if (tokenSessao != null && !tokenSessao.equals(participante.getTokenSessao())) {
            throw new SecurityException("Acesso negado: token de sessão inválido para este participante.");
        }

        participante.declararPago();
        participanteRepository.save(participante);
    }

    @Transactional
    public void confirmarPagamento(String hash, Long participanteId, String hostToken) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));

        if (!mesa.isHost(hostToken)) {
            throw new SecurityException("Apenas o anfitrião pode confirmar pagamentos.");
        }

        Participante participante = participanteRepository.findById(participanteId)
                .orElseThrow(() -> new NoSuchElementException("Participante não encontrado: " + participanteId));

        if (!Objects.equals(participante.getMesaId(), mesa.getId())) {
            throw new IllegalArgumentException("Participante não pertence a esta mesa.");
        }

        participante.confirmarPagamento();
        participanteRepository.save(participante);
    }

    @Transactional
    public void recalcularRateio(String hash, Long hostParticipanteId) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));

        List<ItemComanda> itens = itemComandaRepository.findByMesaId(mesa.getId());
        List<Participante> participantes = participanteRepository.findByMesaId(mesa.getId());

        CalculadorRateio.RateioResultado resultado = CalculadorRateio.calcular(mesa, itens, participantes, hostParticipanteId);

        for (CalculadorRateio.CotaParticipante cota : resultado.cotas()) {
            participantes.stream()
                    .filter(p -> p.getId().equals(cota.participanteId()))
                    .findFirst()
                    .ifPresent(p -> {
                        p.atualizarValores(cota.subtotalConsumo(), cota.valorTaxa());
                        participanteRepository.save(p);
                    });
        }
    }
}
