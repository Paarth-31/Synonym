package com.aiexplorer.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.util.ValidationUtil;
import com.aiexplorer.util.SceneNavigator;

public class SignupController {

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
        // BULLETPROOF WIRING: This forces the buttons to work no matter what
        signupButton.setOnAction(this::handleSignup);
        backButton.setOnAction(this::goToLogin);
    }

    @FXML
    private void handleSignup(ActionEvent event) {
        try {
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
            if (password.length() < 8) {
                showError("Password must be at least 8 characters");
                return;
            }

            if (dbService.registerUser(name, email, username, password, "")) {
                showSuccess("Account created successfully!");
                goToLogin(event);
            } else {
                showError("Failed to create account (email/username taken)");
            }
        } catch (Exception e) {
            e.printStackTrace();
            showError("System error occurred. Check terminal.");
        }
    }

    private void showError(String message) {
        errorLabel.setStyle("-fx-text-fill: #ff5252;");
        errorLabel.setText(message);
    }

    private void showSuccess(String message) {
        errorLabel.setStyle("-fx-text-fill: #10b981;");
        errorLabel.setText(message);
    }

    @FXML
    private void goToLogin(ActionEvent event) {
        Scene scene = SceneNavigator.getSceneFromNode((Node) event.getSource());
        SceneNavigator.loadScene(scene, "/fxml/login.fxml");
    }
}