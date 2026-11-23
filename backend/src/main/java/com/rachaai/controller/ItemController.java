package com.rachaai.controller;

import com.rachaai.service.ItemService;
import com.rachaai.service.dto.AdicionarItemCommand;
import com.rachaai.service.dto.ItemDTO;
import com.rachaai.service.dto.VagaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mesas/{hash}/itens")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemDTO> adicionarItem(@PathVariable String hash,
                                                 @Valid @RequestBody AdicionarItemCommand cmd) {
        ItemDTO dto = itemService.adicionarItem(hash, cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<ItemDTO>> listarItens(@PathVariable String hash) {
        List<ItemDTO> itens = itemService.listarItensDaMesa(hash);
        return ResponseEntity.ok(itens);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removerItem(@PathVariable String hash,
                                            @PathVariable Long itemId,
                                            @RequestHeader("X-Host-Token") String hostToken) {
        itemService.removerItem(hash, itemId, hostToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{itemId}/vagas/{vagaId}/ocupar")
    public ResponseEntity<VagaDTO> ocuparVaga(@PathVariable String hash,
                                              @PathVariable Long itemId,
                                              @PathVariable Long vagaId,
                                              @RequestBody Map<String, Long> payload) {
        Long participanteId = payload.get("participanteId");
        if (participanteId == null) {
            throw new IllegalArgumentException("participanteId é obrigatório");
        }
        VagaDTO vaga = itemService.ocuparVaga(hash, itemId, vagaId, participanteId);
        return ResponseEntity.ok(vaga);
    }

    @PostMapping("/{itemId}/vagas/{vagaId}/desocupar")
    public ResponseEntity<Void> desocuparVaga(@PathVariable String hash,
                                              @PathVariable Long itemId,
                                              @PathVariable Long vagaId,
                                              @RequestBody Map<String, Long> payload) {
        Long participanteId = payload.get("participanteId");
        if (participanteId == null) {
            throw new IllegalArgumentException("participanteId é obrigatório");
        }
        itemService.desocuparVaga(hash, itemId, vagaId, participanteId);
        return ResponseEntity.ok().build();
    }
}
