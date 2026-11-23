package com.rachaai.controller;

import com.rachaai.service.MesaService;
import com.rachaai.service.dto.CriarMesaCommand;
import com.rachaai.service.dto.MesaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @PostMapping
    public ResponseEntity<MesaDTO> criarMesa(@Valid @RequestBody CriarMesaCommand cmd) {
        MesaDTO mesa = mesaService.criarMesa(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(mesa);
    }

    @GetMapping("/{hash}")
    public ResponseEntity<MesaDTO> buscarMesa(@PathVariable String hash) {
        MesaDTO mesa = mesaService.buscarPorHash(hash);
        return ResponseEntity.ok(mesa);
    }

    @PostMapping("/{hash}/travar")
    public ResponseEntity<Void> travarMesa(@PathVariable String hash,
                                           @RequestHeader("X-Host-Token") String hostToken) {
        mesaService.travarMesa(hash, hostToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{hash}/finalizar")
    public ResponseEntity<Void> finalizarMesa(@PathVariable String hash,
                                              @RequestHeader("X-Host-Token") String hostToken) {
        mesaService.finalizarMesa(hash, hostToken);
        return ResponseEntity.ok().build();
    }
}
