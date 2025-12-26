package com.aiexplorer.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Session {
    private int id;
    private int userId;
    private String sessionName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<String> analyzedFilePaths;
    private int totalFilesAnalyzed;
    private String sessionStatus; // ACTIVE, COMPLETED, PAUSED
    private String analysisResults;
    private boolean isActive;

    public Session() {
        this.analyzedFilePaths = new ArrayList<>();
        this.startTime = LocalDateTime.now();
        this.sessionStatus = "ACTIVE";
        this.isActive = true;
        this.totalFilesAnalyzed = 0;
    }

    public Session(int userId, String sessionName) {
        this();
        this.userId = userId;
        this.sessionName = sessionName;
    }

    public Session(int userId, String sessionName, int totalFilesAnalyzed) {
        this();
        this.userId = userId;
        this.sessionName = sessionName;
        this.totalFilesAnalyzed = totalFilesAnalyzed;
    }

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public String getSessionName() {
        return sessionName;
    }
    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }
    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    public List<String> getAnalyzedFilePaths() {
        return analyzedFilePaths;
    }
    public void setAnalyzedFilePaths(List<String> analyzedFilePaths) {
        this.analyzedFilePaths = analyzedFilePaths;
    }
    public int getTotalFilesAnalyzed() {
        return totalFilesAnalyzed;
    }
    public void setTotalFilesAnalyzed(int totalFilesAnalyzed) {
        this.totalFilesAnalyzed = totalFilesAnalyzed;
    }
    public String getSessionStatus() {
        return sessionStatus;
    }
    public void setSessionStatus(String sessionStatus) {
        this.sessionStatus = sessionStatus;
    }
    public String getAnalysisResults() {
        return analysisResults;
    }
    public void setAnalysisResults(String analysisResults) {
        this.analysisResults = analysisResults;
    }
    public boolean isActive() {
        return isActive;
    }
    public void setActive(boolean active) {
        isActive = active;
    }

    public void addAnalyzedFile(String filePath) {
        if (!this.analyzedFilePaths.contains(filePath)) {
            this.analyzedFilePaths.add(filePath);
            this.totalFilesAnalyzed++;
        }
    }

    public void removeAnalyzedFile(String filePath) {
        if (this.analyzedFilePaths.remove(filePath)) {
            this.totalFilesAnalyzed--;
        }
    }

    public void completeSession() {
        this.endTime = LocalDateTime.now();
        this.sessionStatus = "COMPLETED";
        this.isActive = false;
    }

    public void pauseSession() {
        this.sessionStatus = "PAUSED";
        this.isActive = false;
    }

    public void resumeSession() {
        this.sessionStatus = "ACTIVE";
        this.isActive = true;
    }

    public long getSessionDurationSeconds() {
        LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
        return java.time.temporal.ChronoUnit.SECONDS.between(startTime, end);
    }

    public long getSessionDurationMinutes() {
        return getSessionDurationSeconds() / 60;
    }

    public String getSessionInfo() {
        return String.format(
                "Session: %s\n" + "User ID: %d\n" + "Files: %d\n" + "Status: %s\n" + "Duration: %d minutes\n" + "Started: %s", sessionName, userId, totalFilesAnalyzed, sessionStatus, getSessionDurationMinutes(), startTime
        );
    }

    public boolean hasExpired() {
        if (endTime == null) {
            return false;
        }
        return java.time.temporal.ChronoUnit.HOURS.between(endTime, LocalDateTime.now()) > 24;
    }

    public void clearAnalyzedFiles() {
        analyzedFilePaths.clear();
        totalFilesAnalyzed = 0;
    }

    public String getSummary() {
        return String.format(
                "%s - %d files analyzed (%s)",
                sessionName, totalFilesAnalyzed, sessionStatus
        );
    }

    @Override
    public String toString() {
        return "Session{" + "id=" + id + ", userId=" + userId + ", sessionName='" + sessionName + '\'' + ", startTime=" + startTime + ", endTime=" + endTime + ", totalFilesAnalyzed=" + totalFilesAnalyzed + ", sessionStatus='" + sessionStatus + '\'' + ", isActive=" + isActive + '}';
    }
}