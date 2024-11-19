package com.inter_contrat.projects.music_sorter.BackEnd.model;

import java.sql.Blob;

public class AudioFileSend {
    private Long id;
    private String accessPath;
    private String title;
    private String artist;
    private String album;
    private Blob image;
    private Integer yearRelease;
    private Integer number;
    private String genre;

    public AudioFileSend(Long id, String accessPath, String title, String artist, String album, Blob image, Integer yearRelease, Integer number, String genre) {
        this.id = id;
        this.accessPath = accessPath;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.image = image;
        this.yearRelease = yearRelease;
        this.number = number;
        this.genre = genre;
    }
}
