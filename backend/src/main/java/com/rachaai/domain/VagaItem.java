package com.rachaai.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "vagas_item")
public class VagaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ItemComanda itemComanda;

    @Column(name = "participante_id")
    private Long participanteId;

    @NotNull
    @Column(name = "valor_vaga", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorVaga;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusVaga status;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    public VagaItem() {
    }

    public VagaItem(ItemComanda itemComanda, BigDecimal valorVaga) {
        if (valorVaga == null || valorVaga.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor da vaga deve ser maior que zero.");
        }
        this.itemComanda = itemComanda;
        this.valorVaga = valorVaga;
        this.status = StatusVaga.ABERTA;
        this.atualizadoEm = Instant.now();
    }

    public void ocupar(Long participanteId) {
        if (this.status == StatusVaga.OCUPADA) {
            throw new IllegalStateException("Vaga já está ocupada por outro participante.");
        }
        if (participanteId == null) {
            throw new IllegalArgumentException("ID do participante não pode ser nulo.");
        }
        this.participanteId = participanteId;
        this.status = StatusVaga.OCUPADA;
        this.atualizadoEm = Instant.now();
    }

    public void desocupar(Long participanteId) {
        if (this.status != StatusVaga.OCUPADA) {
            throw new IllegalStateException("A vaga já está aberta.");
        }
        if (this.participanteId != null && !this.participanteId.equals(participanteId)) {
            throw new IllegalStateException("Apenas o participante ocupante pode liberar a vaga.");
        }
        this.participanteId = null;
        this.status = StatusVaga.ABERTA;
        this.atualizadoEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItemComanda getItemComanda() {
        return itemComanda;
    }

    public void setItemComanda(ItemComanda itemComanda) {
        this.itemComanda = itemComanda;
    }

    public Long getParticipanteId() {
        return participanteId;
    }

    public void setParticipanteId(Long participanteId) {
        this.participanteId = participanteId;
    }

    public BigDecimal getValorVaga() {
        return valorVaga;
    }

    public void setValorVaga(BigDecimal valorVaga) {
        this.valorVaga = valorVaga;
    }

    public StatusVaga getStatus() {
        return status;
    }

    public void setStatus(StatusVaga status) {
        this.status = status;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VagaItem vagaItem = (VagaItem) o;
        return Objects.equals(id, vagaItem.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
