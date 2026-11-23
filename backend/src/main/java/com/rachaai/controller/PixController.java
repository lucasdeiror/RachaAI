package com.rachaai.controller;

import com.rachaai.domain.Mesa;
import com.rachaai.domain.Participante;
import com.rachaai.domain.PixEmvPayloadGenerator;
import com.rachaai.infra.repository.ParticipanteRepository;
import com.rachaai.service.MesaService;
import com.rachaai.service.dto.PixPayloadDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/mesas/{hash}/pix")
public class PixController {

    private final MesaService mesaService;
    private final ParticipanteRepository participanteRepository;

    public PixController(MesaService mesaService, ParticipanteRepository participanteRepository) {
        this.mesaService = mesaService;
        this.participanteRepository = participanteRepository;
    }

    @GetMapping
    public ResponseEntity<PixPayloadDTO> obterPayloadPix(@PathVariable String hash,
                                                         @RequestParam(required = false) Long participanteId) {
        Mesa mesa = mesaService.buscarEntidadePorHash(hash);
        BigDecimal valor = BigDecimal.ZERO;

        if (participanteId != null) {
            Participante p = participanteRepository.findById(participanteId)
                    .orElseThrow(() -> new NoSuchElementException("Participante não encontrado: " + participanteId));
            if (!p.getMesaId().equals(mesa.getId())) {
                throw new IllegalArgumentException("Participante não pertence a esta mesa.");
            }
            valor = p.getValorFinal();
        }

        String payload = PixEmvPayloadGenerator.gerarPayload(
                mesa.getChavePixHost(),
                mesa.getNomeHost(),
                "SAO PAULO",
                valor,
                mesa.getCodigoHash()
        );

        PixPayloadDTO dto = new PixPayloadDTO(
                mesa.getChavePixHost(),
                mesa.getNomeHost(),
                valor,
                mesa.getCodigoHash(),
                payload
        );

        return ResponseEntity.ok(dto);
    }
}
