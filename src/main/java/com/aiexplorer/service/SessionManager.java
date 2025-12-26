package com.aiexplorer.service;

import com.aiexplorer.model.User;

/**
 * SessionManager - Manages user session and authentication state
 * Singleton pattern to ensure only one session instance exists
 */
public class SessionManager {
    private static SessionManager instance;

    private String currentUserEmail;
    private int currentUserId;
    private String currentUserName;
    private String currentUserProfilePicture;
    private boolean isLoggedIn;
    private User currentUser;

    // Private constructor for singleton pattern
    private SessionManager() {
        this.currentUserEmail = null;
        this.currentUserId = -1;
        this.currentUserName = null;
        this.currentUserProfilePicture = null;
        this.isLoggedIn = false;
        this.currentUser = null;
    }

    /**
     * Get singleton instance of SessionManager
     * @return SessionManager instance
     */
    public static synchronized SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    /**
     * Set the current logged-in user email
     * @param email User's email address
     */
    public void setCurrentUserEmail(String email) {
        this.currentUserEmail = email;
        this.isLoggedIn = (email != null);
        System.out.println(isLoggedIn ? "✓ User logged in: " + email : "✓ User logged out");
    }

    /**
     * Get the current logged-in user email
     * @return User's email or null if not logged in
     */
    public String getCurrentUserEmail() {
        return currentUserEmail;
    }

    /**
     * Set the current user ID
     * @param userId User's database ID
     */
    public void setCurrentUserId(int userId) {
        this.currentUserId = userId;
    }

    /**
     * Get the current user ID
     * @return User's ID or -1 if not logged in
     */
    public int getCurrentUserId() {
        return currentUserId;
    }

    /**
     * Set the current user name
     * @param name User's full name
     */
    public void setCurrentUserName(String name) {
        this.currentUserName = name;
    }

    /**
     * Get the current user name
     * @return User's name or null if not logged in
     */
    public String getCurrentUserName() {
        return currentUserName;
    }

    /**
     * Set the current user's profile picture path
     * @param profilePicture Path to profile picture
     */
    public void setCurrentUserProfilePicture(String profilePicture) {
        this.currentUserProfilePicture = profilePicture;
    }

    /**
     * Get the current user's profile picture path
     * @return Profile picture path or null
     */
    public String getCurrentUserProfilePicture() {
        return currentUserProfilePicture;
    }

    /**
     * ✅ GET CURRENT USER - Returns a User object with all user details
     * @return User object containing email, name, userId, and profile picture
     */
    public User getCurrentUser() {
        if (isLoggedIn && currentUser != null) {
            return currentUser;
        }

        // If no User object exists, create one from current session data
        if (isLoggedIn) {
            User user = new User();
            user.setId(currentUserId);
            user.setEmail(currentUserEmail);
            user.setName(currentUserName);
            user.setProfilePicture(currentUserProfilePicture);
            return user;
        }

        // Not logged in
        return null;
    }

    /**
     * Set the current User object
     * @param user User object with all details
     */
    public void setCurrentUser(User user) {
        this.currentUser = user;
        if (user != null) {
            this.currentUserId = user.getId();
            this.currentUserEmail = user.getEmail();
            this.currentUserName = user.getName();
            this.currentUserProfilePicture = user.getProfilePicture();
            this.isLoggedIn = true;
            System.out.println("✓ Current user set: " + user.getName() + " (" + user.getEmail() + ")");
        } else {
            clearSession();
        }
    }

    /**
     * Check if user is currently logged in
     * @return true if logged in, false otherwise
     */
    public boolean isLoggedIn() {
        return isLoggedIn;
    }

    /**
     * Clear the session (logout)
     */
    public void clearSession() {
        this.currentUserEmail = null;
        this.currentUserId = -1;
        this.currentUserName = null;
        this.currentUserProfilePicture = null;
        this.isLoggedIn = false;
        this.currentUser = null;
        System.out.println("✓ Session cleared");
    }

    /**
     * Set complete user session (after login)
     * @param email User's email
     * @param userId User's ID
     * @param name User's name
     */
    public void setUserSession(String email, int userId, String name) {
        this.currentUserEmail = email;
        this.currentUserId = userId;
        this.currentUserName = name;
        this.isLoggedIn = true;
        System.out.println("✓ Session created for: " + name + " (" + email + ")");
    }

    /**
     * Set complete user session with profile picture
     * @param email User's email
     * @param userId User's ID
     * @param name User's name
     * @param profilePicture Profile picture path
     */
    public void setUserSession(String email, int userId, String name, String profilePicture) {
        this.currentUserEmail = email;
        this.currentUserId = userId;
        this.currentUserName = name;
        this.currentUserProfilePicture = profilePicture;
        this.isLoggedIn = true;
        System.out.println("✓ Session created for: " + name + " (" + email + ")");
    }

    /**
     * Get session summary for debugging
     * @return Session information string
     */
    public String getSessionInfo() {
        return "SessionManager{" +
                "email='" + currentUserEmail + '\'' +
                ", userId=" + currentUserId +
                ", name='" + currentUserName + '\'' +
                ", profilePicture='" + currentUserProfilePicture + '\'' +
                ", isLoggedIn=" + isLoggedIn +
                '}';
    }
}