package com.inter_contrat.projects.music_sorter.BackEnd.service;
import com.inter_contrat.projects.music_sorter.BackEnd.model.AudioInfos;
import com.inter_contrat.projects.music_sorter.BackEnd.repository.AudioInfosRepository;
import com.inter_contrat.projects.music_sorter.BackEnd.model.MusicAttribute;

import org.jaudiotagger.audio.flac.FlacFileReader;
import org.jaudiotagger.audio.flac.metadatablock.MetadataBlockDataPicture;
import org.jaudiotagger.audio.mp3.MP3File;
import org.jaudiotagger.audio.mp3.MP3FileReader;
import org.jaudiotagger.audio.wav.WavFileReader;

import org.jaudiotagger.tag.flac.FlacTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.apache.commons.io.FilenameUtils;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.apache.tika.parser.mp3.Mp3Parser;

import org.jaudiotagger.audio.AudioHeader;
import org.jaudiotagger.tag.FieldKey;
import org.jaudiotagger.tag.Tag;
import org.jaudiotagger.tag.TagField;
import org.jaudiotagger.audio.AudioFileIO;
import org.jaudiotagger.audio.AudioFile;


import java.io.*;

import java.nio.file.*;


import jakarta.transaction.Transactional;

import javax.sql.rowset.serial.SerialBlob;
import java.sql.Blob;
import java.util.*;
import java.util.regex.Pattern;
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
            System.out.println("Name: "+file.getName());
            String ext = FilenameUtils.getExtension(file.getAbsolutePath());
            attributes.put("fileName",file.getName().substring(0,file.getName().length()-ext.length()-1));
            AudioFile audioFile = null;
            byte[] image = new byte[0];
            switch (ext) {
                case "mp3":
                    System.out.println("mp3");
                    audioFile = new MP3FileReader().read(file);
                    Tag tag = audioFile.getTag();
                    attributes.put("image", tag.getFirstArtwork().getBinaryData());
                    System.out.println("desc: "+tag.getFirstArtwork().getDescription());
                    System.out.println("imgUrl: "+tag.getFirstArtwork().getImageUrl());
                    System.out.println("MimeType: "+tag.getFirstArtwork().getMimeType());
                    System.out.println("pictType: "+tag.getFirstArtwork().getPictureType());
                    break;
                case "flac":
                    System.out.println("flac");
                    audioFile = new FlacFileReader().read(file);
                    FlacTag tagFlac = (FlacTag) audioFile.getTag();
                    List<MetadataBlockDataPicture> images= tagFlac.getImages();
                    if (!images.isEmpty()) {
                        attributes.put("image",tagFlac.getImages().getFirst().getImageData());
                    }
                    break;
                case "wav":
                    //audioFile = new WavFileReader().read(file);
                    attributes.put("title",file.getName());
                    System.out.println(attributes);
                    return attributes;
                default:
                    attributes.put("error", "true");
                    return attributes;
            }

            Tag tag = audioFile.getTag();
            System.out.println(tag);
            System.out.println(tag.getClass().getSimpleName());
            attributes.put("title", tag.getFirst(FieldKey.TITLE)==null ? file.getName() : tag.getFirst(FieldKey.TITLE));
            attributes.put("artist",tag.getFirst(FieldKey.ARTIST));
            attributes.put("album",tag.getFirst(FieldKey.ALBUM));
            attributes.put("yearRelease",tag.getFirst(FieldKey.YEAR));
            attributes.put("number",tag.getFirst(FieldKey.TRACK));
            attributes.put("genre",tag.getFirst(FieldKey.GENRE));
            System.out.println(Arrays.toString(image));
            //attributes.put("image",tag.getFirst(FieldKey.COVER_ART));
            /*
            AudioFile f = AudioFileIO.read(file);
            Tag tag = f.getTag();
            AudioHeader AudioHeader = f.getAudioHeader();
            String[] tmpPath = file.getAbsolutePath().split(Pattern.quote(File.separator));

            System.out.println("MEDIA: "+tag.getFirst(FieldKey.MEDIA));
            System.out.println("ENCODER: "+tag.getFirst(FieldKey.ENCODER));

             */
        } catch (Exception e) {
            System.out.println("Error with "+file.getName()+": "+e.getMessage());
            attributes.put("error", "true");
        }
        System.out.println(attributes);
        return attributes;
    }


    public Optional<MusicAttribute> saveAudioFileFromFile(File file) {
        Map<String,Object> attributes = getAttributes(file);
        if (attributes.containsKey("error")) {
            return Optional.empty();
        }
        else {
            AudioInfos audioInfos = new AudioInfos();
            audioInfos.setFileName((String) attributes.get("fileName"));
            audioInfos.setTitle((String) attributes.get("title"));
            audioInfos.setArtist((String) attributes.get("artist"));
            audioInfos.setPath(file.getAbsolutePath());
            audioInfos.setAlbum((String) attributes.get("album"));
            audioInfos.setYearRelease(attributes.get("yearRelease") == null ? -1 : Integer.parseInt((String) attributes.get("yearRelease")));
            audioInfos.setNumber(attributes.get("number") == null ? -1 : Integer.parseInt((String) attributes.get("number")));
            audioInfos.setGenre((String) attributes.get("genre"));
            try {
                if (attributes.containsKey("image") && attributes.get("image") != null) {

                    audioInfos.setImage((byte[]) attributes.get("image"));
                }
            } catch (Exception e) {
                System.out.println("Failed to get image to blob: "+e.getMessage());
            }
            audioInfos.setCreatedAt(new Date());
            System.out.println(audioInfos.toString());
            audioInfosRepository.save(audioInfos);
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
            musicAttributes.forEach(musicAttribute -> {
                copyFile(directoryPathCreated, musicAttribute);
            });
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
            tag.setField(FieldKey.YEAR,musicAttribute.getYearRelease().toString());
            tag.setField(FieldKey.TRACK,musicAttribute.getNumber().toString());
            tag.setField(FieldKey.GENRE,musicAttribute.getGenre());
            AudioFileIO.write(audioFile);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public byte[] createZipFile(List<MusicAttribute> musicsAttributes) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {
            for (MusicAttribute musicAttribute : musicsAttributes) {
                AudioInfos audioInfos = getAudioInfo(musicAttribute);
                String filePath = audioInfos.getPath();
                String ext = FilenameUtils.getExtension(filePath);
                File file = new File(filePath);
                if (file.exists() && file.isFile()) {
                    zipOutputStream.putNextEntry(new ZipEntry(musicAttribute.getFileName()+"."+ext));
                    System.out.println(audioInfos.equalsMetadata(musicAttribute));
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

    public AudioInfos getAudioInfo(MusicAttribute musicAttribute) {
        return audioInfosRepository.findById(musicAttribute.getId()).orElseThrow(() -> new RuntimeException("Audio file not found"));
    }
}

