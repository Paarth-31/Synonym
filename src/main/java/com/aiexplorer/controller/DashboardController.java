package com.aiexplorer.controller;

import com.aiexplorer.model.User;
import com.aiexplorer.model.ChatHistory;
import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.service.SessionManager;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;

import java.util.List;
import java.util.Map;

public class DashboardController {
    @FXML private BorderPane mainBorderPane;
    @FXML private Label welcomeLabel;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Label chatCountLabel;
    @FXML private ListView<String> chatHistoryList; // Assuming simple strings for now
    @FXML private Button getStartedButton;
    @FXML private Label sessionCountLabel;
    @FXML private TextArea chatDetailsArea;

    private DatabaseService dbService = DatabaseService.getInstance();
    private int currentUserId; // REMOVED hardcoded = 1
    private User currentUser;

    @FXML
    public void initialize() {
        currentUser = SessionManager.getInstance().getCurrentUser();
        if (currentUser != null) {
            currentUserId = currentUser.getId();
            welcomeLabel.setText("Welcome, " + currentUser.getName() + "!");
            loadChatHistory();
        } else {
            welcomeLabel.setText("Welcome, Guest!");
            chatDetailsArea.setText("Please log in to see your session history.");
        }

        logoutButton.setOnAction(event -> handleLogout());
        profileButton.setOnAction(event -> navigateToProfile());
        getStartedButton.setOnAction(event -> navigateToAnalysis());
    }

    private void loadChatHistory() {
        if (currentUserId == -1) return;

        List<ChatHistory> history = dbService.getUserChatHistory(currentUserId);
        for (ChatHistory ch : history) {
            addMessageToChat("You: " + ch.getMessage(), true);
            addMessageToChat("AI: " + ch.getResponse(), false);
        }
        chatCountLabel.setText(String.valueOf(history.size()));
        sessionCountLabel.setText(String.valueOf(history.size()));
    }

    private void handleLogout() {
        SessionManager.getInstance().clearSession();
        System.out.println("Logout successful");
    }

    private void navigateToProfile() {
        System.out.println("Navigate to Profile");
    }

    private void navigateToAnalysis() {
        System.out.println("Navigate to New Analysis");
    }
    private void addMessageToChat(String text, boolean isUser) {
        addMessageToChat(text, isUser); // or whatever defaults make sense
    }

}