package com.rachaai.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

public class PixEmvPayloadGenerator {

    private static final String ID_PAYLOAD_FORMAT_INDICATOR = "00";
    private static final String ID_POINT_OF_INITIATION_METHOD = "01";
    private static final String ID_MERCHANT_ACCOUNT_INFORMATION = "26";
    private static final String ID_MERCHANT_CATEGORY_CODE = "52";
    private static final String ID_TRANSACTION_CURRENCY = "53";
    private static final String ID_TRANSACTION_AMOUNT = "54";
    private static final String ID_COUNTRY_CODE = "58";
    private static final String ID_MERCHANT_NAME = "59";
    private static final String ID_MERCHANT_CITY = "60";
    private static final String ID_ADDITIONAL_DATA_FIELD_TEMPLATE = "62";
    private static final String ID_CRC16 = "63";

    public static String gerarPayload(String chavePix, String nomeHost, String cidade, BigDecimal valor, String txId) {
        if (chavePix == null || chavePix.trim().isEmpty()) {
            throw new IllegalArgumentException("Chave Pix é obrigatória.");
        }
        if (nomeHost == null || nomeHost.trim().isEmpty()) {
            nomeHost = "RACHAAI";
        }
        if (cidade == null || cidade.trim().isEmpty()) {
            cidade = "SAO PAULO";
        }

        String nomeSanitizado = normalizar(nomeHost, 25);
        String cidadeSanitizada = normalizar(cidade, 15).toUpperCase();
        String txIdSanitizado = (txId != null && !txId.trim().isEmpty())
                ? txId.trim().replaceAll("[^a-zA-Z0-9]", "").toUpperCase()
                : "***";
        if (txIdSanitizado.length() > 25) {
            txIdSanitizado = txIdSanitizado.substring(0, 25);
        }

        StringBuilder sb = new StringBuilder();

        // 00 - Payload Format Indicator (01)
        sb.append(formatarTLV(ID_PAYLOAD_FORMAT_INDICATOR, "01"));

        // 01 - Point of Initiation Method (12 = Dinâmico ou 11 = Estático com valor fixo)
        sb.append(formatarTLV(ID_POINT_OF_INITIATION_METHOD, "12"));

        // 26 - Merchant Account Information
        String gui = formatarTLV("00", "br.gov.bcb.pix");
        String chave = formatarTLV("01", chavePix.trim());
        sb.append(formatarTLV(ID_MERCHANT_ACCOUNT_INFORMATION, gui + chave));

        // 52 - Merchant Category Code
        sb.append(formatarTLV(ID_MERCHANT_CATEGORY_CODE, "0000"));

        // 53 - Transaction Currency (986 = Real Brasileiro ISO 4217)
        sb.append(formatarTLV(ID_TRANSACTION_CURRENCY, "986"));

        // 54 - Transaction Amount (se maior que zero)
        if (valor != null && valor.compareTo(BigDecimal.ZERO) > 0) {
            String valorFormatado = valor.setScale(2, RoundingMode.HALF_EVEN).toPlainString();
            sb.append(formatarTLV(ID_TRANSACTION_AMOUNT, valorFormatado));
        }

        // 58 - Country Code
        sb.append(formatarTLV(ID_COUNTRY_CODE, "BR"));

        // 59 - Merchant Name
        sb.append(formatarTLV(ID_MERCHANT_NAME, nomeSanitizado));

        // 60 - Merchant City
        sb.append(formatarTLV(ID_MERCHANT_CITY, cidadeSanitizada));

        // 62 - Additional Data Field Template (TxID)
        String refLabel = formatarTLV("05", txIdSanitizado);
        sb.append(formatarTLV(ID_ADDITIONAL_DATA_FIELD_TEMPLATE, refLabel));

        // 63 - CRC16 prefix
        sb.append("6304");

        // Cálculo CRC-16/CCITT-FALSE
        String crc = calcularCRC16(sb.toString());

        return sb.toString() + crc;
    }

    private static String formatarTLV(String id, String valor) {
        int length = valor.getBytes(StandardCharsets.UTF_8).length;
        return String.format("%s%02d%s", id, length, valor);
    }

    private static String normalizar(String texto, int maxLen) {
        String semAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .trim();
        if (semAcentos.isEmpty()) semAcentos = "RACHAAI";
        return semAcentos.length() > maxLen ? semAcentos.substring(0, maxLen) : semAcentos;
    }

    public static String calcularCRC16(String payload) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;

        byte[] bytes = payload.getBytes(StandardCharsets.UTF_8);
        for (byte b : bytes) {
            crc ^= ((b & 0xFF) << 8);
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc = crc << 1;
                }
                crc &= 0xFFFF;
            }
        }

        return String.format("%04X", crc);
    }
}
