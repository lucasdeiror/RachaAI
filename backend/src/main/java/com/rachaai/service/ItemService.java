package com.rachaai.service;

import com.rachaai.domain.ItemComanda;
import com.rachaai.domain.Mesa;
import com.rachaai.domain.TipoItem;
import com.rachaai.domain.VagaItem;
import com.rachaai.infra.repository.ItemComandaRepository;
import com.rachaai.infra.repository.MesaRepository;
import com.rachaai.infra.repository.VagaItemRepository;
import com.rachaai.service.dto.AdicionarItemCommand;
import com.rachaai.service.dto.ItemDTO;
import com.rachaai.service.dto.VagaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemComandaRepository itemComandaRepository;
    private final VagaItemRepository vagaItemRepository;
    private final MesaRepository mesaRepository;

    public ItemService(ItemComandaRepository itemComandaRepository,
                       VagaItemRepository vagaItemRepository,
                       MesaRepository mesaRepository) {
        this.itemComandaRepository = itemComandaRepository;
        this.vagaItemRepository = vagaItemRepository;
        this.mesaRepository = mesaRepository;
    }

    @Transactional
    public ItemDTO adicionarItem(String hash, AdicionarItemCommand cmd) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        mesa.validarEditavel();

        ItemComanda item;
        if (cmd.tipo() == TipoItem.INDIVIDUAL) {
            item = ItemComanda.criarIndividual(
                    mesa.getId(),
                    cmd.descricao(),
                    cmd.quantidade() > 0 ? cmd.quantidade() : 1,
                    cmd.valorTotal(),
                    cmd.participanteId()
            );
        } else {
            int vagas = cmd.vagasTotais() > 0 ? cmd.vagasTotais() : 2;
            item = ItemComanda.criarCompartilhado(
                    mesa.getId(),
                    cmd.descricao(),
                    cmd.quantidade() > 0 ? cmd.quantidade() : 1,
                    cmd.valorTotal(),
                    vagas
            );
        }

        ItemComanda salvo = itemComandaRepository.save(item);
        return ItemDTO.fromDomain(salvo);
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> listarItensDaMesa(String hash) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        return itemComandaRepository.findByMesaId(mesa.getId())
                .stream()
                .map(ItemDTO::fromDomain)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removerItem(String hash, Long itemId, String hostToken) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        if (!mesa.isHost(hostToken)) {
            throw new SecurityException("Acesso negado: apenas o anfitrião pode remover itens.");
        }
        mesa.validarEditavel();

        ItemComanda item = itemComandaRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item não encontrado: " + itemId));
        if (!item.getMesaId().equals(mesa.getId())) {
            throw new IllegalArgumentException("O item não pertence a esta mesa.");
        }

        itemComandaRepository.delete(item);
    }

    @Transactional
    public VagaDTO ocuparVaga(String hash, Long itemId, Long vagaId, Long participanteId) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        mesa.validarEditavel();

        int linhasAfetadas = vagaItemRepository.ocuparVagaAtomicamente(vagaId, participanteId, Instant.now());
        if (linhasAfetadas == 0) {
            throw new IllegalStateException("Vaga indisponível ou já ocupada por outro participante.");
        }

        VagaItem vagaAtualizada = vagaItemRepository.findById(vagaId)
                .orElseThrow(() -> new NoSuchElementException("Vaga não encontrada: " + vagaId));
        return VagaDTO.fromDomain(vagaAtualizada);
    }

    @Transactional
    public void desocuparVaga(String hash, Long itemId, Long vagaId, Long participanteId) {
        Mesa mesa = mesaRepository.findByCodigoHash(hash.toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Mesa não encontrada com o código: " + hash));
        mesa.validarEditavel();

        int linhasAfetadas = vagaItemRepository.desocuparVagaAtomicamente(vagaId, participanteId, Instant.now());
        if (linhasAfetadas == 0) {
            throw new IllegalStateException("Apenas o participante ocupante pode desocupar a vaga.");
        }
    }
}
