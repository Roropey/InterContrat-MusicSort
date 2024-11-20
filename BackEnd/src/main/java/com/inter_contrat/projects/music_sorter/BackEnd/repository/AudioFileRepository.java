package com.inter_contrat.projects.music_sorter.BackEnd.repository;

import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {
    Optional<AudioFile> findByPath(String path);
}

