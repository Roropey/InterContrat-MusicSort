package com.inter_contrat.projects.music_sorter.BackEnd.service;
import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioInfos;
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


import java.io.*;

import java.nio.file.*;


import jakarta.transaction.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
            AudioInfos audioInfos = new AudioInfos();
            audioInfos.setTitle(attributes.get("title"));
            audioInfos.setArtist(attributes.get("artist"));
            audioInfos.setPath(file.getAbsolutePath());
            audioInfos.setAlbum(attributes.get("album"));
            audioInfos.setYearRelease(attributes.get("yearRelease") == null ? -1 : Integer.parseInt(attributes.get("yearRelease")));
            audioInfos.setNumber(attributes.get("number") == null ? -1 : Integer.parseInt(attributes.get("number")));
            audioInfos.setGenre(attributes.get("genre"));
            audioInfos.setCreatedAt(new java.util.Date());
            audioFileRepository.save(audioInfos);
            return Optional.ofNullable(audioInfos.getMusicAttribute());
        }
    }
    @Transactional
    public List<MusicAttribute> saveAudioFilesFromDirectoryPath(String directoryPath) {
        try {
            List<Path> filesPath = findAllFiles(directoryPath);
            List<MusicAttribute> musics = new ArrayList<>();
            for (Path path : filesPath) {
                Optional<AudioInfos> music = findByPath(path.toString());
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
        AudioInfos audioInfos = audioFileRepository.findById(id).orElseThrow();
        audioInfos.setTitle(title);
        audioInfos.setArtist(artist);
    }

    public MusicAttribute getAudioFileMetadata(Long id) {
        AudioInfos audioInfos = audioFileRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return audioInfos.getMusicAttribute();
    }

    public File getAudioFile(Long id) {
        AudioInfos audioInfos = audioFileRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return new File(audioInfos.getPath());
    }

    public Optional<AudioInfos> findByPath(String path) {
        return audioFileRepository.findByPath(path);
    }

    public void saveRepositorySelection(String directoryStringPath, List<MusicAttribute> musicAttributes) {
        Path directoryPath = Paths.get(directoryStringPath);
        try {
            Path directoryPathCreated = Files.createDirectories(directoryPath);
            musicAttributes.forEach(musicAttribute -> {
                copyFile(directoryPathCreated, musicAttribute);
            });
        } catch (IOException e) {
            throw new RuntimeException("Catch exception when trying creating directories:" + e);
        }
    }

    private void copyFile(Path directory, MusicAttribute musicAttribute) {
        AudioInfos audioInfos = audioFileRepository.findById(musicAttribute.getId()).orElseThrow(() -> new RuntimeException("Audio file not found"));
        String[] tmpPath = audioInfos.getPath().split(Pattern.quote(File.separator));
        try {
            if (!Files.exists( Path.of(directory +"/"+ tmpPath[tmpPath.length - 1]))) {
                Files.copy(Path.of(audioInfos.getPath()), Path.of(directory +"/"+ tmpPath[tmpPath.length - 1]));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public byte[] createZipFile(List<MusicAttribute> musicsAttributes) throws IOException {
        String[] files = musicsAttributes.stream().map(this::getPathAudio).toArray(String[]::new);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {
            for (String filePath : files) {
                File file = new File(filePath);
                if (file.exists() && file.isFile()) {
                    zipOutputStream.putNextEntry(new ZipEntry(file.getName()));
                    Files.copy(file.toPath(), zipOutputStream);
                    /*
                    try (InputStream inputStream = Files.newInputStream(path)) {
                        IOUtils.copy(inputStream, zipOutputStream);
                    }*/
                    zipOutputStream.closeEntry();
                } else {
                    System.out.println("Not found file: "+filePath);
                }
            }
        }
        return byteArrayOutputStream.toByteArray();
    }

    private String getPathAudio(MusicAttribute musicAttribute) {
        AudioInfos audioInfos = audioFileRepository.findById(musicAttribute.getId()).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return audioInfos.getPath();
    }
}

