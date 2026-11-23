package com.rachaai.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "participantes")
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "mesa_id", nullable = false)
    private Long mesaId;

    @NotBlank
    @Column(name = "nome", nullable = false, length = 60)
    private String nome;

    @NotBlank
    @Column(name = "token_sessao", nullable = false, length = 64)
    private String tokenSessao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status_quitacao", nullable = false, length = 20)
    private StatusQuitacao statusQuitacao;

    @NotNull
    @Column(name = "valor_consumo", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorConsumo;

    @NotNull
    @Column(name = "valor_taxa", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTaxa;

    @NotNull
    @Column(name = "valor_final", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorFinal;

    @Column(name = "criado_em")
    private Instant criadoEm;

    public Participante() {
    }

    public Participante(Long mesaId, String nome) {
        if (mesaId == null) {
            throw new IllegalArgumentException("Mesa ID é obrigatório.");
        }
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do participante não pode ser vazio.");
        }
        this.mesaId = mesaId;
        this.nome = nome.trim();
        this.tokenSessao = UUID.randomUUID().toString().replace("-", "");
        this.statusQuitacao = StatusQuitacao.CONSUMINDO;
        this.valorConsumo = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        this.valorTaxa = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        this.valorFinal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        this.criadoEm = Instant.now();
    }

    public void declararPago() {
        if (this.statusQuitacao == StatusQuitacao.CONFIRMADO) {
            throw new IllegalStateException("Pagamento já foi confirmado pelo anfitrião.");
        }
        this.statusQuitacao = StatusQuitacao.DECLAROU_PAGO;
    }

    public void confirmarPagamento() {
        this.statusQuitacao = StatusQuitacao.CONFIRMADO;
    }

    public void reabrirConsumo() {
        if (this.statusQuitacao == StatusQuitacao.CONFIRMADO) {
            throw new IllegalStateException("Não é possível reabrir consumo de participante já confirmado.");
        }
        this.statusQuitacao = StatusQuitacao.CONSUMINDO;
    }

    public void atualizarValores(BigDecimal consumo, BigDecimal taxa) {
        this.valorConsumo = (consumo != null ? consumo : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_EVEN);
        this.valorTaxa = (taxa != null ? taxa : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_EVEN);
        this.valorFinal = this.valorConsumo.add(this.valorTaxa).setScale(2, RoundingMode.HALF_EVEN);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMesaId() {
        return mesaId;
    }

    public void setMesaId(Long mesaId) {
        this.mesaId = mesaId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTokenSessao() {
        return tokenSessao;
    }

    public void setTokenSessao(String tokenSessao) {
        this.tokenSessao = tokenSessao;
    }

    public StatusQuitacao getStatusQuitacao() {
        return statusQuitacao;
    }

    public void setStatusQuitacao(StatusQuitacao statusQuitacao) {
        this.statusQuitacao = statusQuitacao;
    }

    public BigDecimal getValorConsumo() {
        return valorConsumo;
    }

    public void setValorConsumo(BigDecimal valorConsumo) {
        this.valorConsumo = valorConsumo;
    }

    public BigDecimal getValorTaxa() {
        return valorTaxa;
    }

    public void setValorTaxa(BigDecimal valorTaxa) {
        this.valorTaxa = valorTaxa;
    }

    public BigDecimal getValorFinal() {
        return valorFinal;
    }

    public void setValorFinal(BigDecimal valorFinal) {
        this.valorFinal = valorFinal;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Participante that = (Participante) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
