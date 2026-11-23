package com.rachaai.service.dto;

import java.math.BigDecimal;

public record PixPayloadDTO(
        String chavePix,
        String nomeHost,
        BigDecimal valor,
        String txId,
        String payloadBrCode
) {}
