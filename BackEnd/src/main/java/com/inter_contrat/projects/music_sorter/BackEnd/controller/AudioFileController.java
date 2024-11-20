package com.inter_contrat.projects.music_sorter.BackEnd.controller;
import com.inter_contrat.projects.music_sorter.BackEnd.model.MusicAttribute;
import com.inter_contrat.projects.music_sorter.BackEnd.service.AudioFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.io.FileInputStream;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/audio")
public class AudioFileController {

    @Autowired
    private AudioFileService audioFileService;

    @GetMapping("/upload")
    public List<MusicAttribute> uploadAudioFile(@RequestParam("filePath") String filePath) throws IOException {
        System.out.println("received request");
        List<MusicAttribute> audioFile = audioFileService.saveAudioFilesFromDirectoryPath(filePath);
        System.out.println("saved audio file");
        System.out.println(audioFile.toString());
        return audioFile;
    }

    @GetMapping("/metadata/{id}")
    public MusicAttribute getAudioMetadata(@PathVariable Long id) {
        return audioFileService.getAudioFileMetadata(id);
    }
    @PutMapping("/update/{id}")
    public String updateAudioMetadata(@PathVariable Long id,
                                      @RequestParam("title") String title,
                                      @RequestParam("artist") String artist) {
        audioFileService.updateAudioMetadata(id, title, artist);
        return "Metadata updated successfully";
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<byte[]> getAudioFile(@PathVariable Long id) throws IOException {
//        File file = audioFileService.getAudioFile(id);
//        byte[] bytes = Files.readAllBytes(file.toPath());
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_TYPE, "audio/mp3")
//                .body(bytes);
//    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getAudioFile(@PathVariable Long id) throws IOException {
        File file = audioFileService.getAudioFile(id);
        InputStream inputStream = new FileInputStream(file);
        InputStreamResource resource = new InputStreamResource(inputStream);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                .body(resource);
    }
}
