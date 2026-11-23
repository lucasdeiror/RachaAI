package com.rachaai.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "mesas")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "codigo_hash", unique = true, nullable = false, length = 16)
    private String codigoHash;

    @NotBlank
    @Column(name = "nome_role", nullable = false, length = 100)
    private String nomeRole;

    @NotBlank
    @Column(name = "chave_pix_host", nullable = false, length = 140)
    private String chavePixHost;

    @NotBlank
    @Column(name = "nome_host", nullable = false, length = 80)
    private String nomeHost;

    @NotBlank
    @Column(name = "token_host", nullable = false, length = 64)
    private String tokenHost;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "modo", nullable = false, length = 20)
    private ModoMesa modo;

    @NotNull
    @Column(name = "percentual_taxa", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaServico;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusMesa status;

    @Column(name = "criado_em")
    private Instant criadoEm;

    @Column(name = "expira_em")
    private Instant expiraEm;

    public Mesa() {
    }

    public Mesa(String codigoHash, String nomeRole, String chavePixHost, String nomeHost, ModoMesa modo, BigDecimal taxaServico) {
        if (chavePixHost == null || chavePixHost.trim().isEmpty()) {
            throw new IllegalArgumentException("Chave Pix do anfitrião não pode ser vazia.");
        }
        if (nomeHost == null || nomeHost.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do anfitrião não pode ser vazio.");
        }
        this.codigoHash = (codigoHash != null && !codigoHash.trim().isEmpty()) ? codigoHash.trim().toUpperCase() : gerarCodigoHashPadrao();
        this.nomeRole = (nomeRole != null && !nomeRole.trim().isEmpty()) ? nomeRole.trim() : "Mesa";
        this.chavePixHost = chavePixHost.trim();
        this.nomeHost = nomeHost.trim();
        this.tokenHost = UUID.randomUUID().toString().replace("-", "");
        this.modo = (modo != null) ? modo : ModoMesa.COMANDA_JUSTA;
        this.taxaServico = (taxaServico != null) ? taxaServico : new BigDecimal("10.00");
        this.status = StatusMesa.ABERTA;
        this.criadoEm = Instant.now();
        this.expiraEm = this.criadoEm.plus(48, ChronoUnit.HOURS);
    }

    private String gerarCodigoHashPadrao() {
        int randomNum = (int) (Math.random() * 9000) + 1000;
        return "ROL-" + randomNum;
    }

    public void travar() {
        if (this.status != StatusMesa.ABERTA) {
            throw new IllegalStateException("Apenas mesas ABERTAS podem ser travadas. Status atual: " + this.status);
        }
        this.status = StatusMesa.TRAVADA;
    }

    public void finalizar() {
        if (this.status == StatusMesa.FINALIZADA) {
            throw new IllegalStateException("Mesa já está finalizada.");
        }
        this.status = StatusMesa.FINALIZADA;
    }

    public void validarEditavel() {
        if (this.status != StatusMesa.ABERTA) {
            throw new IllegalStateException("Mesa não está aberta para edições. Status atual: " + this.status);
        }
    }

    public boolean isHost(String token) {
        return token != null && token.equals(this.tokenHost);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoHash() {
        return codigoHash;
    }

    public void setCodigoHash(String codigoHash) {
        this.codigoHash = codigoHash;
    }

    public String getNomeRole() {
        return nomeRole;
    }

    public void setNomeRole(String nomeRole) {
        this.nomeRole = nomeRole;
    }

    public String getChavePixHost() {
        return chavePixHost;
    }

    public void setChavePixHost(String chavePixHost) {
        this.chavePixHost = chavePixHost;
    }

    public String getNomeHost() {
        return nomeHost;
    }

    public void setNomeHost(String nomeHost) {
        this.nomeHost = nomeHost;
    }

    public String getTokenHost() {
        return tokenHost;
    }

    public void setTokenHost(String tokenHost) {
        this.tokenHost = tokenHost;
    }

    public ModoMesa getModo() {
        return modo;
    }

    public void setModo(ModoMesa modo) {
        this.modo = modo;
    }

    public BigDecimal getTaxaServico() {
        return taxaServico;
    }

    public void setTaxaServico(BigDecimal taxaServico) {
        this.taxaServico = taxaServico;
    }

    public StatusMesa getStatus() {
        return status;
    }

    public void setStatus(StatusMesa status) {
        this.status = status;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(Instant expiraEm) {
        this.expiraEm = expiraEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Mesa mesa = (Mesa) o;
        return Objects.equals(id, mesa.id) || Objects.equals(codigoHash, mesa.codigoHash);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, codigoHash);
    }
}
