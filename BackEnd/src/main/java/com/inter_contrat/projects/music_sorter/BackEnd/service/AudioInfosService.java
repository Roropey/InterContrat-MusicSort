package com.inter_contrat.projects.music_sorter.BackEnd.service;
import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioInfos;
import com.inter_contrat.projects.music_sorter.BackEnd.repository.AudioInfosRepository;
import com.inter_contrat.projects.music_sorter.BackEnd.model.MusicAttribute;

import org.jaudiotagger.audio.flac.FlacFileReader;
import org.jaudiotagger.audio.flac.metadatablock.MetadataBlockDataPicture;
import org.jaudiotagger.audio.mp3.MP3FileReader;

import org.jaudiotagger.tag.flac.FlacTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.apache.commons.io.FilenameUtils;
import org.jaudiotagger.tag.FieldKey;
import org.jaudiotagger.tag.Tag;
import org.jaudiotagger.audio.AudioFileIO;
import org.jaudiotagger.audio.AudioFile;


import java.io.*;

import java.nio.file.*;


import jakarta.transaction.Transactional;

import java.util.*;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class AudioInfosService {

    @Autowired
    private AudioInfosRepository audioInfosRepository;

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

    private Map<String,Object> getAttributes(File file) {
        Map<String,Object> attributes = new HashMap<>();
        try {
            //System.out.println("Name: "+file.getName());
            String ext = FilenameUtils.getExtension(file.getAbsolutePath());
            attributes.put("fileName",file.getName().substring(0,file.getName().length()-ext.length()-1));
            attributes.put("extension",ext);
            AudioFile audioFile;
            switch (ext) {
                case "mp3":
                    //System.out.println("mp3");
                    audioFile = new MP3FileReader().read(file);
                    Tag tag = audioFile.getTag();
                    attributes.put("image", tag.getFirstArtwork().getBinaryData());
                    //System.out.println("desc: "+tag.getFirstArtwork().getDescription());
                    //System.out.println("imgUrl: "+tag.getFirstArtwork().getImageUrl());
                    //System.out.println("MimeType: "+tag.getFirstArtwork().getMimeType());
                    //System.out.println("pictType: "+tag.getFirstArtwork().getPictureType());
                    break;
                case "flac":
                    //System.out.println("flac");
                    audioFile = new FlacFileReader().read(file);
                    FlacTag tagFlac = (FlacTag) audioFile.getTag();
                    List<MetadataBlockDataPicture> images= tagFlac.getImages();
                    if (!images.isEmpty()) {
                        attributes.put("image",tagFlac.getImages().getFirst().getImageData());
                    }
                    break;
                case "wav":
                    //System.out.println("wav");
                    //audioFile = new WavFileReader().read(file);
                    attributes.put("title",file.getName());
                    return attributes;
                default:
                    attributes.put("error", "true");
                    return attributes;
            }

            Tag tag = audioFile.getTag();

            //System.out.println(tag.getClass().getSimpleName());
            attributes.put("title", tag.getFirst(FieldKey.TITLE)==null ? file.getName() : tag.getFirst(FieldKey.TITLE));
            attributes.put("artist",tag.getFirst(FieldKey.ARTIST));
            attributes.put("album",tag.getFirst(FieldKey.ALBUM));
            attributes.put("yearRelease",tag.getFirst(FieldKey.YEAR));
            attributes.put("number",tag.getFirst(FieldKey.TRACK));
            attributes.put("genre",tag.getFirst(FieldKey.GENRE));
        } catch (Exception e) {
            //System.out.println("Error with "+file.getName()+": "+e.getMessage());
            attributes.put("error", "true");
        }
        //System.out.println(attributes);
        return attributes;
    }


    public Optional<AudioInfos> generateAudioFile(File file) {
        Map<String,Object> attributes = getAttributes(file);
        if (attributes.containsKey("error")) {
            return Optional.empty();
        }
        else {
            AudioInfos audioInfos = new AudioInfos();
            audioInfos.setFileName((String) attributes.get("fileName"));
            audioInfos.setExtension((String) attributes.get("extension"));
            audioInfos.setTitle((String) attributes.get("title"));
            audioInfos.setArtist((String) attributes.get("artist"));
            audioInfos.setPath(file.getAbsolutePath());
            audioInfos.setAlbum((String) attributes.get("album"));
            try {
                audioInfos.setYearRelease(attributes.get("yearRelease") == null ? -1 : Integer.parseInt((String) attributes.get("yearRelease")));
            } catch (NumberFormatException _) {
                ;;
            }
            try {
                audioInfos.setNumber(attributes.get("number") == null ? -1 : Integer.parseInt((String) attributes.get("number")));
            } catch (NumberFormatException _) {
                ;;
            }
            audioInfos.setGenre((String) attributes.get("genre"));
            /*
            try {
                if (attributes.containsKey("image") && attributes.get("image") != null) {

                    audioInfos.setImage((byte[]) attributes.get("image"));
                }
            } catch (Exception e) {
                System.out.println("Failed to get image to blob: "+e.getMessage());
            }*/

            audioInfos.setCreatedAt(new Date());
            //System.out.println(audioInfos.toString());
            return Optional.of(audioInfos);
        }
    }
    @Transactional
    public List<MusicAttribute> saveAudioFilesFromDirectoryPath(String directoryPath) {
        try {
            List<Path> filesPath = findAllFiles(directoryPath);
            List<MusicAttribute> musicsAttributesList = new ArrayList<>();
            for (Path path : filesPath) {
                Optional<AudioInfos> musicOptional = findByPath(path.toString());
                File file = path.toFile();
                Optional<AudioInfos> audioInfosOptional = generateAudioFile(file);
                if (musicOptional.isPresent()) {
                    AudioInfos musicAudioInfos = musicOptional.get();
                    if (audioInfosOptional.isPresent()){
                        AudioInfos audioInfos = audioInfosOptional.get();
                        MusicAttribute musicAttributeFromAnalyse = audioInfos.getMusicAttribute();
                        if (musicAudioInfos.equalsMetadata(musicAttributeFromAnalyse)) {
                            System.out.println("Same metadata, no change for "+musicAttributeFromAnalyse.getFileName());
                            musicsAttributesList.add(musicAudioInfos.getMusicAttribute());
                        }
                        else {
                            System.out.println("Not same metadata, so change for "+musicAttributeFromAnalyse.getFileName());
                            musicAudioInfos.setMusicAttribute(musicAttributeFromAnalyse);
                            audioInfosRepository.save(musicAudioInfos);
                            musicsAttributesList.add(musicAudioInfos.getMusicAttribute());
                        }
                    }
                    else {

                        System.out.println("No audio file found so remove "+musicAudioInfos.getFileName());
                        audioInfosRepository.deleteById(musicAudioInfos.getId());
                    }
                }
                else {
                    if (audioInfosOptional.isPresent()) {
                        AudioInfos audioInfos = audioInfosOptional.get();
                        System.out.println("Not in database so add "+audioInfos.getFileName());
                        audioInfosRepository.save(audioInfos);
                        musicsAttributesList.add(audioInfos.getMusicAttribute());
                    }
                }
            }
            return musicsAttributesList;
        } catch (IOException e) {
            throw new RuntimeException("Catch exception when trying find all files:" + e);
        }
        
    }

    public MusicAttribute getAudioFileMetadata(Long id) {
        AudioInfos audioInfos = audioInfosRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return audioInfos.getMusicAttribute();
    }

    public File getAudioFile(Long id) {
        AudioInfos audioInfos = audioInfosRepository.findById(id).orElseThrow(() -> new RuntimeException("Audio file not found"));
        return new File(audioInfos.getPath());
    }

    public Optional<AudioInfos> findByPath(String path) {
        return audioInfosRepository.findByPath(path);
    }

    public void saveRepositorySelection(String directoryStringPath, List<MusicAttribute> musicAttributes) {
        Path directoryPath = Paths.get(directoryStringPath);
        try {
            Path directoryPathCreated = Files.createDirectories(directoryPath);
            musicAttributes.forEach(musicAttribute -> copyFile(directoryPathCreated, musicAttribute));
        } catch (IOException e) {
            throw new RuntimeException("Catch exception when trying creating directories:" + e);
        }
    }

    private void copyFile(Path directory, MusicAttribute musicAttribute) {
        AudioInfos audioInfos = getAudioInfo(musicAttribute);
        String ext = FilenameUtils.getExtension(audioInfos.getPath());
        Path goal = Path.of(directory +"/"+ musicAttribute.getFileName()+"."+ext);
        try {
            if (!Files.exists(goal)) {
                Files.copy(Path.of(audioInfos.getPath()), goal);
            }
            File newFile = new File(goal.toString());
            if (!audioInfos.equalsMetadata(musicAttribute)){
                writeAudioFile(musicAttribute, newFile);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void writeAudioFile(MusicAttribute musicAttribute, File file) {

        try {
            AudioFile audioFile = AudioFileIO.read(file);
            Tag tag = audioFile.getTag();
            tag.setField(FieldKey.TITLE,musicAttribute.getTitle());
            tag.setField(FieldKey.ARTIST,musicAttribute.getArtist());
            tag.setField(FieldKey.ALBUM,musicAttribute.getAlbum());
            try {
                tag.setField(FieldKey.YEAR,musicAttribute.getYearRelease().toString());
            } catch (NullPointerException _){
                ;;
            }
            try {
                tag.setField(FieldKey.TRACK,musicAttribute.getNumber().toString());
            } catch (NullPointerException _){
                ;;
            }
            tag.setField(FieldKey.GENRE,musicAttribute.getGenre());
            AudioFileIO.write(audioFile);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public byte[] createZipFile(List<MusicAttribute> musicsAttributes) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {
            int limit=0;
            for (MusicAttribute musicAttribute : musicsAttributes) {
                System.out.println("Current: "+(limit++));
                AudioInfos audioInfos = getAudioInfo(musicAttribute);
                String filePath = audioInfos.getPath();
                String ext = FilenameUtils.getExtension(filePath);
                File file = new File(filePath);
                if (file.exists() && file.isFile()) {
                    zipOutputStream.putNextEntry(new ZipEntry(musicAttribute.getFileName()+"."+ext));
                    if (audioInfos.equalsMetadata(musicAttribute)){
                        Files.copy(file.toPath(), zipOutputStream);
                    } else {
                        String tmpPath = file.getParent()+"/tmp."+ext;
                        Files.copy(file.toPath(), Path.of(tmpPath));
                        File tmp = new File(tmpPath);
                        writeAudioFile(musicAttribute, tmp);
                        Files.copy(tmp.toPath(), zipOutputStream);
                        Files.deleteIfExists(tmp.toPath());
                    }

                    zipOutputStream.closeEntry();
                } else {
                    System.out.println("Not found file: "+filePath);
                }
            }
        }
        return byteArrayOutputStream.toByteArray();
    }

    public AudioInfos getAudioInfo(MusicAttribute musicAttribute) {
        return audioInfosRepository.findById(musicAttribute.getId()).orElseThrow(() -> new RuntimeException("Audio file not found"));
    }
}

