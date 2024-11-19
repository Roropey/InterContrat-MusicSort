package com.inter_contrat.projects.music_sorter.BackEnd.service;
import com.inter_contrat.projects.music_sorter.BackEnd.repository.AudioFileRepository;
import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioSystem;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class AudioFileService {

    @Autowired
    private AudioFileRepository audioFileRepository;

    private final String audioDirectory = "audio-files"; // Répertoire où les fichiers audio sont stockés

    public void saveAudioFile(MultipartFile file) throws IOException {
        // Créez un fichier sur le serveur
        Path path = Paths.get(audioDirectory, file.getOriginalFilename());
        Files.createDirectories(path.getParent());
        file.transferTo(path);

        // Récupérer les métadonnées (exemple simple, à adapter selon le format audio)
        AudioFile audioFile = new AudioFile();
        audioFile.setFileName(file.getOriginalFilename());
        audioFile.setFilePath(path.toString());
        audioFile.setFileSize(file.getSize());
        audioFile.setCreatedAt(LocalDateTime.now());

        // Exemple de traitement pour extraire des métadonnées (comme le titre et l'artiste)
        try {
            AudioFileFormat format = AudioSystem.getAudioFileFormat(path.toFile());
            // Ici, on peut extraire les métadonnées si elles sont disponibles dans le fichier
            // AudioFileFormat n'a pas de méthode directe pour extraire des métadonnées comme l'artiste ou le titre
            // Cependant, vous pourriez utiliser des bibliothèques externes comme MP3agic pour gérer cela.
        } catch (Exception e) {
            e.printStackTrace();
        }

        audioFileRepository.save(audioFile);
    }

    public List<AudioFile> getAllAudioFiles() {
        return audioFileRepository.findAll();
    }

    public Optional<AudioFile> getAudioFileById(Long id) {
        return audioFileRepository.findById(id);
    }

    public void updateMetadata(Long id, String artist, String title) {
        Optional<AudioFile> audioFileOptional = audioFileRepository.findById(id);
        if (audioFileOptional.isPresent()) {
            AudioFile audioFile = audioFileOptional.get();
            audioFile.setArtist(artist);
            audioFile.setTitle(title);
            audioFileRepository.save(audioFile);
        }
    }
}
