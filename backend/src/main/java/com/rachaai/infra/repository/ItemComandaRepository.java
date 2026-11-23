package com.rachaai.infra.repository;

import com.rachaai.domain.ItemComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemComandaRepository extends JpaRepository<ItemComanda, Long> {
    List<ItemComanda> findByMesaId(Long mesaId);
}
