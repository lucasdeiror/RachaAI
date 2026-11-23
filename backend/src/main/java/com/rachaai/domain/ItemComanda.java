package com.rachaai.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Entity
@Table(name = "itens_comanda")
public class ItemComanda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "mesa_id", nullable = false)
    private Long mesaId;

    @NotBlank
    @Column(name = "descricao", nullable = false, length = 120)
    private String descricao;

    @Column(name = "quantidade", nullable = false)
    private int quantidade;

    @NotNull
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoItem tipo;

    @Column(name = "participante_id")
    private Long participanteId;

    @Column(name = "vagas_totais", nullable = false)
    private int vagasTotais;

    @OneToMany(mappedBy = "itemComanda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<VagaItem> vagas = new ArrayList<>();

    @Column(name = "criado_em")
    private Instant criadoEm;

    public ItemComanda() {
    }

    public static ItemComanda criarIndividual(Long mesaId, String descricao, int quantidade, BigDecimal valorTotal, Long participanteId) {
        if (mesaId == null) {
            throw new IllegalArgumentException("Mesa ID é obrigatório.");
        }
        if (descricao == null || descricao.trim().isEmpty()) {
            throw new IllegalArgumentException("Descrição do item não pode ser vazia.");
        }
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero.");
        }
        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor total deve ser maior que zero.");
        }

        ItemComanda item = new ItemComanda();
        item.mesaId = mesaId;
        item.descricao = descricao.trim();
        item.quantidade = quantidade;
        item.valorTotal = valorTotal.setScale(2, RoundingMode.HALF_EVEN);
        item.tipo = TipoItem.INDIVIDUAL;
        item.participanteId = participanteId;
        item.vagasTotais = 1;
        item.criadoEm = Instant.now();
        return item;
    }

    public static ItemComanda criarCompartilhado(Long mesaId, String descricao, int quantidade, BigDecimal valorTotal, int vagasTotais) {
        if (mesaId == null) {
            throw new IllegalArgumentException("Mesa ID é obrigatório.");
        }
        if (descricao == null || descricao.trim().isEmpty()) {
            throw new IllegalArgumentException("Descrição do item não pode ser vazia.");
        }
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero.");
        }
        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor total deve ser maior que zero.");
        }
        if (vagasTotais <= 0) {
            throw new IllegalArgumentException("Vagas totais devem ser maiores que zero.");
        }

        ItemComanda item = new ItemComanda();
        item.mesaId = mesaId;
        item.descricao = descricao.trim();
        item.quantidade = quantidade;
        item.valorTotal = valorTotal.setScale(2, RoundingMode.HALF_EVEN);
        item.tipo = TipoItem.COMPARTILHADO;
        item.participanteId = null;
        item.vagasTotais = vagasTotais;
        item.criadoEm = Instant.now();

        BigDecimal valorVaga = item.valorTotal.divide(BigDecimal.valueOf(vagasTotais), 2, RoundingMode.HALF_EVEN);
        for (int i = 0; i < vagasTotais; i++) {
            item.vagas.add(new VagaItem(item, valorVaga));
        }

        return item;
    }

    public void ocuparVaga(Long vagaId, Long participanteId) {
        if (this.tipo != TipoItem.COMPARTILHADO) {
            throw new IllegalStateException("Apenas itens compartilhados possuem vagas.");
        }
        VagaItem vaga = this.vagas.stream()
                .filter(v -> Objects.equals(v.getId(), vagaId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Vaga não encontrada com ID: " + vagaId));
        vaga.ocupar(participanteId);
    }

    public void ocuparPrimeiraVagaDisponivel(Long participanteId) {
        if (this.tipo != TipoItem.COMPARTILHADO) {
            throw new IllegalStateException("Apenas itens compartilhados possuem vagas.");
        }
        VagaItem vaga = this.vagas.stream()
                .filter(v -> v.getStatus() == StatusVaga.ABERTA)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Não há vagas abertas para este item."));
        vaga.ocupar(participanteId);
    }

    public void desocuparVaga(Long vagaId, Long participanteId) {
        if (this.tipo != TipoItem.COMPARTILHADO) {
            throw new IllegalStateException("Apenas itens compartilhados possuem vagas.");
        }
        VagaItem vaga = this.vagas.stream()
                .filter(v -> Objects.equals(v.getId(), vagaId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Vaga não encontrada com ID: " + vagaId));
        vaga.desocupar(participanteId);
    }

    public List<VagaItem> getVagasAbertas() {
        return this.vagas.stream()
                .filter(v -> v.getStatus() == StatusVaga.ABERTA)
                .collect(Collectors.toList());
    }

    public List<VagaItem> getVagasOcupadas() {
        return this.vagas.stream()
                .filter(v -> v.getStatus() == StatusVaga.OCUPADA)
                .collect(Collectors.toList());
    }

    public List<VagaItem> getVagasOcupadasPor(Long participanteId) {
        if (participanteId == null) return List.of();
        return this.vagas.stream()
                .filter(v -> v.getStatus() == StatusVaga.OCUPADA && Objects.equals(v.getParticipanteId(), participanteId))
                .collect(Collectors.toList());
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public TipoItem getTipo() {
        return tipo;
    }

    public void setTipo(TipoItem tipo) {
        this.tipo = tipo;
    }

    public Long getParticipanteId() {
        return participanteId;
    }

    public void setParticipanteId(Long participanteId) {
        this.participanteId = participanteId;
    }

    public int getVagasTotais() {
        return vagasTotais;
    }

    public void setVagasTotais(int vagasTotais) {
        this.vagasTotais = vagasTotais;
    }

    public List<VagaItem> getVagas() {
        return vagas;
    }

    public void setVagas(List<VagaItem> vagas) {
        this.vagas = vagas;
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
        ItemComanda that = (ItemComanda) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
