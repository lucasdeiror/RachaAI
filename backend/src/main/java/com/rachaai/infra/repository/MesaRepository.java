package com.rachaai.infra.repository;

import com.rachaai.domain.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    Optional<Mesa> findByCodigoHash(String codigoHash);
    Optional<Mesa> findByCodigoHashAndTokenHost(String codigoHash, String tokenHost);
}
