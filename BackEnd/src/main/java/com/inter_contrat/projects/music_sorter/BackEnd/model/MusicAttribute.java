package com.inter_contrat.projects.music_sorter.BackEnd.model;

import java.sql.Blob;

public class MusicAttribute {
    private Long id;
    private String accessPath;
    private String fileName;
    private String title;
    private String artist;
    private String album;
    private byte[] image;
    private Integer yearRelease;
    private Integer number;
    private String genre;

    public MusicAttribute(Long id, String accessPath, String fileName, String title, String artist, String album, byte[] image, Integer yearRelease, Integer number, String genre) {
        this.id = id;
        this.accessPath = accessPath;
        this.fileName = fileName;
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
                ", fileName='" + fileName + '\'' +
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


    public String getFileName() {
        return fileName;
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

    public byte[] getImage() {
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
