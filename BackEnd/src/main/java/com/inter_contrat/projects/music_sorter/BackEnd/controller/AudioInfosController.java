package com.inter_contrat.projects.music_sorter.BackEnd.controller;
import com.inter_contrat.projects.music_sorter.BackEnd.model.ApiResponse;
import com.inter_contrat.projects.music_sorter.BackEnd.model.MusicAttribute;
import com.inter_contrat.projects.music_sorter.BackEnd.service.AudioInfosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.io.FileInputStream;
import java.io.IOException;
import org.springframework.http.HttpHeaders;

import java.io.File;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/audio")
public class AudioInfosController {

    @Autowired
    private AudioInfosService audioInfosService;

    @GetMapping("/upload")
    public List<MusicAttribute> uploadAudioFile(@RequestParam("filePath") String filePath) throws IOException {
        //System.out.println("received request");
        return audioInfosService.saveAudioFilesFromDirectoryPath(filePath);
    }

    @GetMapping("/metadata/{id}")
    public MusicAttribute getAudioMetadata(@PathVariable Long id) {
        return audioInfosService.getAudioFileMetadata(id);
    }

    @PostMapping("/check")
    public ResponseEntity<Object> updateAudioMetadata(@RequestBody MusicAttribute musicAttribute) {
        try {
            audioInfosService.getAudioInfo(musicAttribute);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse(false,"Music not found"));
        }
        //System.out.println("Check pass for "+musicAttribute.getFileName());
        return ResponseEntity.ok(new ApiResponse(true,"Music found"));
    }

    @PostMapping("/save")
    public void saveAudioFile(@RequestParam("savePath") String savePath, @RequestBody List<MusicAttribute> selectedMusics) {
        audioInfosService.saveRepositorySelection(savePath, selectedMusics);
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadZip(@RequestBody List<MusicAttribute> selectedMusics){
        try {
            byte[] zipFile = audioInfosService.createZipFile(selectedMusics);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + "test" + ".zip\"");
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
            return ResponseEntity.ok().headers(headers).body(zipFile);
        } catch (IOException e) {
            System.out.println("Error in downloading zip: "+e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getAudioFile(@PathVariable Long id) throws IOException {
        try {

            File file = audioInfosService.getAudioFile(id);
            InputStream inputStream = new FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(inputStream);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .body(resource);
        } catch (Exception e) {
            System.out.println("Error in getting audio file: "+e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
