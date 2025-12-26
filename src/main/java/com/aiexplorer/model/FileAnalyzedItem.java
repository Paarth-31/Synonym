package com.aiexplorer.model;

import java.time.LocalDateTime;

public class FileAnalyzedItem {
    private int id;
    private String name;
    private String keywords;
    private String genreName;
    private double genreScore;
    private String fileLocation;
    private double confidenceScore;
    private LocalDateTime analyzedAt;

    public FileAnalyzedItem(int id, String name, String keywords, String genreName, double genreScore,
                            String fileLocation, double confidenceScore, LocalDateTime analyzedAt) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.genreName = genreName;
        this.genreScore = genreScore;
        this.fileLocation = fileLocation;
        this.confidenceScore = confidenceScore;
        this.analyzedAt = analyzedAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }
    public String getGenreName() { return genreName; } // CHANGED
    public void setGenreName(String genreName) { this.genreName = genreName; } // CHANGED
    public double getGenreScore() { return genreScore; } // ADDED
    public void setGenreScore(double genreScore) { this.genreScore = genreScore; } // ADDED
    public String getFileLocation() { return fileLocation; }
    public void setFileLocation(String fileLocation) { this.fileLocation = fileLocation; }
    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}