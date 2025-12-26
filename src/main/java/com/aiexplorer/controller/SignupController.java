package com.aiexplorer.controller;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.util.ValidationUtil;

public class SignupController {
    @FXML private AnchorPane root;
    @FXML private TextField fullNameField;
    @FXML private TextField emailField;
    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private PasswordField confirmPasswordField;
    @FXML private Button signupButton;
    @FXML private Label errorLabel;
    @FXML private Button backButton;
    @FXML private ProgressBar strengthBar;
    @FXML private Label strengthLabel;

    private DatabaseService dbService = DatabaseService.getInstance();

    @FXML
    public void initialize() {
        signupButton.setOnAction(e -> handleSignup());
        backButton.setOnAction(event -> navigateToLogin());
    }

    private void handleSignup() {
        String name = fullNameField.getText().trim();
        String email = emailField.getText().trim();
        String username = usernameField.getText().trim();
        String password = passwordField.getText();
        String confirmPassword = confirmPasswordField.getText();

        if (!ValidationUtil.isNotEmpty(name) || !ValidationUtil.isNotEmpty(email) || !ValidationUtil.isNotEmpty(username) || password.isEmpty()) {
            showError("All fields are required");
            return;
        }
        if (!ValidationUtil.isValidEmail(email)) {
            showError("Please enter a valid email");
            return;
        }
        if (!ValidationUtil.isValidUsername(username)) {
            showError("Username must be 3-20 alphanumeric characters");
            return;
        }
        if (!password.equals(confirmPassword)) {
            showError("Passwords do not match");
            return;
        }
        if (password.length() < 8) { // Matched FXML prompt [cite: 78]
            showError("Password must be at least 8 characters");
            return;
        }
        if (dbService.registerUser(name, email, username, password, "")) { // profile path empty for now
            showSuccess("Account created successfully!");
            navigateToLogin();
        } else {
            showError("Failed to create account (email or username may already exist)");
        }
    }

    private void showError(String message) {
        errorLabel.setStyle("-fx-text-fill: red;");
        errorLabel.setText("✗ " + message);
    }

    private void showSuccess(String message) {
        errorLabel.setStyle("-fx-text-fill: green;");
        errorLabel.setText("✓ " + message);
    }

    private void navigateToLogin() {
        System.out.println("Navigate to Login");
    }
}