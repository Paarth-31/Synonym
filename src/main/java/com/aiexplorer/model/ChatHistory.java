package com.aiexplorer.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatHistory {
    private int id;
    private int userId;
    private String sessionTitle;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private int fileCount;
    private List<String> analyzedFiles;
    private String summary;
    private String message;
    private String response;
    private LocalDateTime timestamp;

    public ChatHistory() {
        this.analyzedFiles = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    public ChatHistory(int userId, String sessionTitle) {
        this();
        this.userId = userId;
        this.sessionTitle = sessionTitle;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public int getFileCount() { return fileCount; }
    public void setFileCount(int fileCount) { this.fileCount = fileCount; }
    public List<String> getAnalyzedFiles() { return analyzedFiles; }
    public void setAnalyzedFiles(List<String> analyzedFiles) { this.analyzedFiles = analyzedFiles; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}