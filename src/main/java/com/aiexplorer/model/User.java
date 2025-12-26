
package com.aiexplorer.model;

import java.time.LocalDateTime;

public class User {
    private int id;
    private String email;
    private String name;
    private String username;
    private String password;
    private String profilePicture;
    private LocalDateTime createdAt;

    public User() {
        this.id = -1;
        this.email = null;
        this.name = null;
        this.username = null;
        this.password = null;
        this.profilePicture = null;
        this.createdAt = null;
    }

    public User(int id, String email, String name, String username, String password, String profilePicture) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.username = username;
        this.password = password;
        this.profilePicture = profilePicture;
        this.createdAt = LocalDateTime.now();
    }

    public User(String email, String name) {
        this.email = email;
        this.name = name;
        this.username = email.split("@")[0];  // Generate username from email
        this.id = -1;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return name != null ? name : "N/A";
    }

    public String getUsername() {
        if (username != null && !username.isEmpty()) return username;
        if (email != null && !email.isEmpty()) return email.split("@")[0];
        return "user_" + id;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getProfilePicture() {
        return profilePicture;
    }
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    @Override
    public String toString() {
        return "User{" + "id=" + id + ", email='" + email + '\'' + ", name='" + name + '\'' + ", username='" + username + '\'' + ", profilePicture='" + profilePicture + '\'' + ", createdAt=" + createdAt + '}';
    }

    public boolean isValid() {
        return id >= 0 && email != null && !email.isEmpty() &&
                name != null && !name.isEmpty();
    }

    public boolean hasCompleteProfile() {
        return id >= 0 && email != null && !email.isEmpty() &&
                name != null && !name.isEmpty() &&
                password != null && !password.isEmpty();
    }

    public String getDisplayName() {
        if (name != null && !name.isEmpty()) return name;
        return email != null ? email : "Unknown User";
    }
}