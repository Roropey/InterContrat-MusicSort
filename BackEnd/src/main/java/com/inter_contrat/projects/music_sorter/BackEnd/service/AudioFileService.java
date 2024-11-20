package com.inter_contrat.projects.music_sorter.BackEnd.service;
import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioFile;
import com.inter_contrat.projects.music_sorter.BackEnd.repository.AudioFileRepository;
import com.inter_contrat.projects.music_sorter.BackEnd.model.MusicAttribute;
import org.apache.tika.parser.audio.AudioParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.apache.tika.parser.mp3.Mp3Parser;



import java.io.FileInputStream;
import java.io.IOException;

import java.nio.file.*;


import jakarta.transaction.Transactional;

import java.io.File;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
public class AudioFileService {

    @Autowired
    private AudioFileRepository audioFileRepository;

    private List<Path> findAllFiles(String directoryPath) throws IOException {
        List<Path> fileList = new ArrayList<>();
        Path path = Paths.get(directoryPath);

        if  (!Files.exists(path) || !Files.isDirectory(path)) {
            throw new IllegalArgumentException("Path does not correspond to a file or a directory.");
        }

        try(Stream<Path> stream = Files.walk(path)) {
            stream.filter(Files::isRegularFile)
                    .forEach(fileList::add);
        }

        return fileList;
    }

    private Map<String,String> getAttributes(File file) {
        Map<String,String> attributes = new HashMap<>();
        // Extraire les métadonnées du fichier audio
        BodyContentHandler handler = new BodyContentHandler();
        Metadata metadata = new Metadata();
        ParseContext context = new ParseContext();
        Parser parser = file.getAbsolutePath().endsWith("mp3") ?
                new Mp3Parser() : new AudioParser();
        try (FileInputStream inputStream = new FileInputStream(file)) {
            parser.parse(inputStream, handler, metadata, context);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        if (metadata.get("X-TIKA:EXCEPTION:warn")==null){
            String[] tmpPath = file.getAbsolutePath().split(Pattern.quote(File.separator));
            attributes.put("title", metadata.get("dc:title")==null ? tmpPath[tmpPath.length-1] : metadata.get("dc:title"));
            attributes.put("artist", metadata.get("xmpDM:artist"));
            attributes.put("album", metadata.get("xmpDM:album"));
            attributes.put("yearRelease", metadata.get("xmpDM:releaseDate"));
            attributes.put("number", metadata.get("xmpDM:trackNumber"));
            attributes.put("genre", metadata.get("xmpDM:genre"));
            attributes.put("image", metadata.get("xmpDM:albumArtURI"));        }
        else {
            attributes.put("error", "true");
        }

        System.out.println(attributes);
        return attributes;
    }

    public Optional<MusicAttribute> saveAudioFileFromFile(File file) {
        Map<String,String> attributes = getAttributes(file);
        if (attributes.containsKey("error")) {
            return Optional.empty();
        }
        else {
            AudioFile audioFile = new AudioFile();
            audioFile.setTitle(attributes.get("title"));
            audioFile.setArtist(attributes.get("artist"));
            audioFile.setPath(file.getAbsolutePath());
            audioFile.setAlbum(attributes.get("album"));
            audioFile.setYearRelease(attributes.get("yearRelease") == null ? -1 : Integer.parseInt(attributes.get("yearRelease")));
            audioFile.setNumber(attributes.get("number") == null ? -1 : Integer.parseInt(attributes.get("number")));
            audioFile.setGenre(attributes.get("genre"));
            audioFile.setCreatedAt(new java.util.Date());
            audioFileRepository.save(audioFile);
            return Optional.ofNullable(audioFile.getMusicAttribute());
        }
    }

    public List<MusicAttribute> saveAudioFilesFromDirectoryPath(String directoryPath) {
        try {
            List<Path> filesPath = findAllFiles(directoryPath);
            List<MusicAttribute> musics = new ArrayList<>();
            for (Path path : filesPath) {
                Optional<AudioFile> music = findByPath(path.toString());
                if (music.isPresent()) {
                     musics.add(music.get().getMusicAttribute());
                }
                else {
                    File file = path.toFile();
                     Optional<MusicAttribute> musicAttribute = saveAudioFileFromFile(file);
                    musicAttribute.ifPresent(musics::add);
                }
            }
            return musics;
        } catch (IOException e) {
            throw new RuntimeException("Catch exception when trying find all files:" + e);
        }
        
    }



    @Transactional
    public void updateAudioMetadata(Long id, String title, String artist) {
        AudioFile audioFile = audioFileRepository.findById(id).orElseThrow();
        audioFile.setTitle(title);
        audioFile.setArtist(artist);
    }

    public MusicAttribute getAudioFileMetadata(Long id) {
        AudioFile audioFile = audioFileRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return audioFile.getMusicAttribute();
    }

    public File getAudioFile(Long id) {
        AudioFile audioFile = audioFileRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return new File(audioFile.getPath());
    }

    public Optional<AudioFile> findByPath(String path) {
        return audioFileRepository.findByPath(path);
    }
}

