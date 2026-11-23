package com.rachaai.infra.repository;

import com.rachaai.domain.VagaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface VagaItemRepository extends JpaRepository<VagaItem, Long> {

    List<VagaItem> findByItemComandaId(Long itemId);

    @Modifying
    @Query("UPDATE VagaItem v SET v.participanteId = :participanteId, v.status = com.rachaai.domain.StatusVaga.OCUPADA, v.atualizadoEm = :agora WHERE v.id = :vagaId AND v.status = com.rachaai.domain.StatusVaga.ABERTA")
    int ocuparVagaAtomicamente(@Param("vagaId") Long vagaId, @Param("participanteId") Long participanteId, @Param("agora") Instant agora);

    @Modifying
    @Query("UPDATE VagaItem v SET v.participanteId = null, v.status = com.rachaai.domain.StatusVaga.ABERTA, v.atualizadoEm = :agora WHERE v.id = :vagaId AND v.participanteId = :participanteId AND v.status = com.rachaai.domain.StatusVaga.OCUPADA")
    int desocuparVagaAtomicamente(@Param("vagaId") Long vagaId, @Param("participanteId") Long participanteId, @Param("agora") Instant agora);
}
