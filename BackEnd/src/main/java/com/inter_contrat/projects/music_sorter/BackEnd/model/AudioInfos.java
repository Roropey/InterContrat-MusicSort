package com.inter_contrat.projects.music_sorter.BackEnd.model;
import jakarta
        .persistence.Entity;
import jakarta.persistence.*;

import java.sql.Blob;
import java.util.Date;

@Entity
public class AudioFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String path;

    private String title;
    private String artist;
    private String album;
    private Blob image;
    private Integer yearRelease;
    private Integer number;
    private String genre;


    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    // Getter et Setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public Blob getImage() {
        return image;
    }

    public void setImage(Blob image) {
        this.image = image;
    }

    public Integer getYearRelease() {
        return yearRelease;
    }

    public void setYearRelease(Integer yearRelease) {
        this.yearRelease = yearRelease;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public MusicAttribute getMusicAttribute() {
        return new MusicAttribute(this.id, "", this.title, this.artist, this.album, null, this.yearRelease, this.number, this.genre);
    }

}
