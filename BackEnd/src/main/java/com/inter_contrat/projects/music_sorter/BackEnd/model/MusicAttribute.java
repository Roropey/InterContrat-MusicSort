package com.inter_contrat.projects.music_sorter.BackEnd.model;

import java.sql.Blob;

public class MusicAttribute {
    private Long id;
    private String accessPath;
    private String title;
    private String artist;
    private String album;
    private Blob image;
    private Integer yearRelease;
    private Integer number;
    private String genre;

    public MusicAttribute(Long id, String accessPath, String title, String artist, String album, Blob image, Integer yearRelease, Integer number, String genre) {
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
    @Override
    public String toString() {
        return "MusicAttribute{" +
                "id=" + id +
                ", accessPath='" + accessPath + '\'' +
                ", title='" + title + '\'' +
                ", artist='" + artist + '\'' +
                ", album='" + album + '\'' +
                ", image=" + image +
                ", yearRelease=" + yearRelease +
                ", number=" + number +
                ", genre='" + genre + '\'' +
                '}';
    }
    public Long getId() {
        return id;
    }

    public String getAccessPath() {
        return accessPath;
    }

    public String getTitle() {
        return title;
    }

    public String getArtist() {
        return artist;
    }

    public String getAlbum() {
        return album;
    }

    public Blob getImage() {
        return image;
    }

    public Integer getYearRelease() {
        return yearRelease;
    }

    public Integer getNumber() {
        return number;
    }

    public String getGenre() {
        return genre;
    }
}
