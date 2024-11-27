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
import org.springframework.web.multipart.MultipartFile;
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

    @PostMapping("/save")
    public void saveAudioFile(@RequestParam("savePath") String savePath, @RequestBody List<MusicAttribute> selectedMusics) {
        audioFileService.saveRepositorySelection(savePath, selectedMusics);
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadZip(@RequestBody List<MusicAttribute> selectedMusics){
        //@RequestParam("nameZip") String nameZip,
        try {
            System.out.println("received request");
            byte[] zipFile = audioFileService.createZipFile(selectedMusics);
            System.out.println("bef header");
            HttpHeaders headers = new HttpHeaders();
            System.out.println("bef disposi");
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + "test" + ".zip\"");
            System.out.println("bef type");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
            System.out.println(ResponseEntity.ok().headers(headers).body(zipFile));
            return ResponseEntity.ok().headers(headers).body(zipFile);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

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
