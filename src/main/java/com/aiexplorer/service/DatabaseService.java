package com.aiexplorer.service;

import com.aiexplorer.model.User;
import com.aiexplorer.model.ChatHistory;
import com.aiexplorer.util.PasswordUtil;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class DatabaseService {

    private static DatabaseService instance;
    // Login DB
    private String loginDbUrl;
    private String loginDbUser;
    private String loginDbPassword;
    // Files DB
    private String filesDbUrl;
    private String filesDbUser;
    private String filesDbPassword;

    private DatabaseService() {
        try {
            Properties props = new Properties();
            try (InputStream input = new FileInputStream("config.properties")) {
                props.load(input);

                // Login DB (auth + chat)
                this.loginDbUrl = props.getProperty(
                        "db.login.url",
                        "jdbc:postgresql://localhost:5432/synonym_login_db"
                );
                this.loginDbUser = props.getProperty("db.login.user", "synonym");
                this.loginDbPassword = props.getProperty("db.login.password", "Synonym@123");

                // Files DB (media_files)
                this.filesDbUrl = props.getProperty(
                        "db.files.url",
                        "jdbc:postgresql://localhost:5432/synonym_files_db"
                );
                this.filesDbUser = props.getProperty("db.files.user", "synonym");
                this.filesDbPassword = props.getProperty("db.files.password", "Synonym@123");

            } catch (IOException e) {
                System.err.println("✗ config.properties not found or invalid, using defaults. Error: " + e.getMessage());

                // Fallback defaults if file missing
                this.loginDbUrl = "jdbc:postgresql://localhost:5432/synonym_login_db";
                this.loginDbUser = "synonym";
                this.loginDbPassword = "Synonym@123";

                this.filesDbUrl = "jdbc:postgresql://localhost:5432/synonym_files_db";
                this.filesDbUser = "synonym";
                this.filesDbPassword = "Synonym@123";
            }

            Class.forName("org.postgresql.Driver");
            System.out.println("✓ PostgreSQL Driver loaded");
        } catch (ClassNotFoundException e) {
            System.err.println("✗ PostgreSQL Driver not found: " + e.getMessage());
        }
    }

    public static synchronized DatabaseService getInstance() {
        if (instance == null) instance = new DatabaseService();
        return instance;
    }

    // ---------- CONNECTION HELPERS ----------

    private Connection getLoginConnection() throws SQLException {
        return DriverManager.getConnection(loginDbUrl, loginDbUser, loginDbPassword);
    }

    private Connection getFilesConnection() throws SQLException {
        return DriverManager.getConnection(filesDbUrl, filesDbUser, filesDbPassword);
    }

    // ---------- TABLE CREATION ----------

    /** Call once at startup (e.g. from AIFileExplorerApp) */
    public void ensureLoginTablesExist() {
        try (Connection conn = getLoginConnection();
             Statement stmt = conn.createStatement()) {

            String usersTable = "CREATE TABLE IF NOT EXISTS users (" +
                    "id SERIAL PRIMARY KEY," +
                    "name VARCHAR(100)," +
                    "email VARCHAR(100) UNIQUE," +
                    "username VARCHAR(100) UNIQUE," +
                    "password VARCHAR(255)," +
                    "profile_picture TEXT," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")";

            String chatTable = "CREATE TABLE IF NOT EXISTS chat_history (" +
                    "id SERIAL PRIMARY KEY," +
                    "user_id INTEGER REFERENCES users(id)," +
                    "message TEXT," +
                    "response TEXT," +
                    "timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")";

            stmt.execute(usersTable);
            stmt.execute(chatTable);
            System.out.println("✓ Login DB tables ready");
        } catch (SQLException e) {
            System.err.println("✗ Login DB error: " + e.getMessage());
        }
    }

    /** Call once at startup (e.g. from AIFileExplorerApp) */
    public void ensureFileTablesExist() {
        try (Connection conn = getFilesConnection();
             Statement stmt = conn.createStatement()) {

            String mediaTable = "CREATE TABLE IF NOT EXISTS media_files (" +
                    "id SERIAL PRIMARY KEY," +
                    "name TEXT UNIQUE," +
                    "keywords TEXT," +
                    "genre_name TEXT," +
                    "genre_score DECIMAL(5,3)," +
                    "file_location TEXT," +
                    "confidence_score DECIMAL(5,3)," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")";

            stmt.execute(mediaTable);
            System.out.println("✓ Files DB tables ready");
        } catch (SQLException e) {
            System.err.println("✗ Files DB error: " + e.getMessage());
        }
    }

    // ---------- AUTH / USER METHODS (LOGIN DB) ----------

    public boolean registerUser(String name, String email, String username,
                                String password, String profilePicture) {
        String sql = "INSERT INTO users (name, email, username, password, profile_picture) " +
                "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            pstmt.setString(2, email);
            pstmt.setString(3, username);
            pstmt.setString(4, PasswordUtil.hashPassword(password));
            pstmt.setString(5, profilePicture);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("✗ Registration error: " + e.getMessage());
            return false;
        }
    }

    public boolean loginUser(String emailOrUsername, String password) {
        String sql = "SELECT password FROM users WHERE email = ? OR username = ?";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, emailOrUsername);
            pstmt.setString(2, emailOrUsername);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                String storedHash = rs.getString("password");
                return PasswordUtil.verifyPassword(password, storedHash);
            }
            return false;
        } catch (SQLException e) {
            System.err.println("✗ Login error: " + e.getMessage());
            return false;
        }
    }

    public boolean updatePassword(String email, String newPassword) {
        String sql = "UPDATE users SET password = ? WHERE email = ?";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, PasswordUtil.hashPassword(newPassword));
            pstmt.setString(2, email);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("✗ Update password error: " + e.getMessage());
            return false;
        }
    }

    public User getUserByEmailOrUsername(String emailOrUsername) {
        String sql = "SELECT * FROM users WHERE email = ? OR username = ?";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, emailOrUsername);
            pstmt.setString(2, emailOrUsername);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setUsername(rs.getString("username"));
                user.setProfilePicture(rs.getString("profile_picture"));
                Timestamp ts = rs.getTimestamp("created_at");
                if (ts != null) {
                    user.setCreatedAt(ts.toLocalDateTime());
                } else {
                    user.setCreatedAt(LocalDateTime.now());
                }
                return user;
            }
        } catch (SQLException e) {
            System.err.println("✗ Get user error: " + e.getMessage());
        }
        return null;
    }

    // ---------- CHAT (LOGIN DB) ----------

    public boolean saveChatMessage(int userId, String message, String response) {
        String sql = "INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            pstmt.setString(2, message);
            pstmt.setString(3, response);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("✗ Chat save error: " + e.getMessage());
            return false;
        }
    }

    public List<ChatHistory> getUserChatHistory(int userId) {
        List<ChatHistory> history = new ArrayList<>();
        String sql = "SELECT message, response, timestamp FROM chat_history " +
                "WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50";
        try (Connection conn = getLoginConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                ChatHistory ch = new ChatHistory();
                ch.setUserId(userId);
                ch.setMessage(rs.getString("message"));
                ch.setResponse(rs.getString("response"));
                Timestamp ts = rs.getTimestamp("timestamp");
                if (ts != null) ch.setTimestamp(ts.toLocalDateTime());
                history.add(ch);
            }
        } catch (SQLException e) {
            System.err.println("✗ Chat history error: " + e.getMessage());
        }
        return history;
    }

    // ---------- FILE ANALYSIS (FILES DB) ----------

    public boolean saveOrUpdateFileAnalysis(String name,
                                            String keywords,
                                            String genreName,
                                            double genreScore,
                                            String fileLocation,
                                            double confidenceScore) {
        String sql = "INSERT INTO media_files " +
                "(name, keywords, genre_name, genre_score, file_location, confidence_score) " +
                "VALUES (?, ?, ?, ?, ?, ?) " +
                "ON CONFLICT (name) DO UPDATE SET " +
                "keywords = EXCLUDED.keywords, " +
                "genre_name = EXCLUDED.genre_name, " +
                "genre_score = EXCLUDED.genre_score, " +
                "file_location = EXCLUDED.file_location, " +
                "confidence_score = EXCLUDED.confidence_score";
        try (Connection conn = getFilesConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            pstmt.setString(2, keywords);
            pstmt.setString(3, genreName);
            pstmt.setDouble(4, genreScore);
            pstmt.setString(5, fileLocation);
            pstmt.setDouble(6, confidenceScore);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("✗ File save error: " + e.getMessage());
            return false;
        }
    }

    // Add any file-query methods here, always using getFilesConnection()
}
