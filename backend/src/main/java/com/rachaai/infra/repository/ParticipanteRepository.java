package com.rachaai.infra.repository;

import com.rachaai.domain.Participante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipanteRepository extends JpaRepository<Participante, Long> {
    List<Participante> findByMesaId(Long mesaId);
    Optional<Participante> findByMesaIdAndTokenSessao(Long mesaId, String tokenSessao);
}
