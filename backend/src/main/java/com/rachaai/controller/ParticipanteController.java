package com.rachaai.controller;

import com.rachaai.service.ParticipanteService;
import com.rachaai.service.dto.ParticipanteDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mesas/{hash}/participantes")
public class ParticipanteController {

    private final ParticipanteService participanteService;

    public ParticipanteController(ParticipanteService participanteService) {
        this.participanteService = participanteService;
    }

    @PostMapping
    public ResponseEntity<ParticipanteDTO> entrarNaMesa(@PathVariable String hash,
                                                        @RequestBody Map<String, String> payload) {
        String nome = payload.get("nome");
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do participante é obrigatório.");
        }
        ParticipanteDTO participante = participanteService.entrarNaMesa(hash, nome);
        return ResponseEntity.status(HttpStatus.CREATED).body(participante);
    }

    @GetMapping
    public ResponseEntity<List<ParticipanteDTO>> listarParticipantes(@PathVariable String hash) {
        List<ParticipanteDTO> lista = participanteService.listarParticipantes(hash);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{id}/declarar-pago")
    public ResponseEntity<Void> declararPagamento(@PathVariable String hash,
                                                  @PathVariable Long id,
                                                  @RequestHeader(value = "X-Session-Token", required = false) String sessionToken) {
        participanteService.declararPagamento(hash, id, sessionToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<Void> confirmarPagamento(@PathVariable String hash,
                                                   @PathVariable Long id,
                                                   @RequestHeader("X-Host-Token") String hostToken) {
        participanteService.confirmarPagamento(hash, id, hostToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recalcular")
    public ResponseEntity<Void> recalcularRateio(@PathVariable String hash,
                                                 @RequestParam(required = false) Long hostParticipanteId) {
        participanteService.recalcularRateio(hash, hostParticipanteId);
        return ResponseEntity.ok().build();
    }
}
