package com.inter_contrat.projects.music_sorter.BackEnd.repository;

import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioInfos;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AudioInfosRepository extends JpaRepository<AudioInfos, Long> {
    Optional<AudioInfos> findByPath(String path);
}

