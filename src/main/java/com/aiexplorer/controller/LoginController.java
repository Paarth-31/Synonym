package com.aiexplorer.controller;

import com.aiexplorer.model.User;
import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.service.SessionManager;
import com.aiexplorer.util.SceneNavigator;
import javafx.fxml.FXML;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;

public class LoginController {
    @FXML private AnchorPane root;
    @FXML private TextField usernameField; // Was emailField
    @FXML private PasswordField passwordField;
    @FXML private Button loginButton;
    @FXML private Label errorLabel;
    @FXML private Button signupButton;
    @FXML private Button forgotPasswordButton;
    @FXML private CheckBox rememberMe;
    @FXML private ProgressBar loadingBar;

    private DatabaseService dbService = DatabaseService.getInstance();

    @FXML
    public void initialize() {
        loginButton.setOnAction(event -> handleLogin());
        signupButton.setOnAction(event -> navigateToSignup());
        forgotPasswordButton.setOnAction(event -> navigateToForgotPassword());
    }

    private void handleLogin() {
        String emailOrUsername = usernameField.getText().trim();
        String password = passwordField.getText();

        if (emailOrUsername.isEmpty() || password.isEmpty()) {
            showError("Username and password required");
            return;
        }
        loadingBar.setVisible(true); // Show loading
        if (dbService.loginUser(emailOrUsername, password)) {
            User user = dbService.getUserByEmailOrUsername(emailOrUsername);
            if (user != null) {
                SessionManager.getInstance().setCurrentUser(user);
                showSuccess("Login successful!");
                navigateToDashboard();
            } else {
                showError("Could not find user details after login");
            }
        } else {
            showError("Invalid username or password");
        }
        loadingBar.setVisible(false);
    }

    private void showError(String message) {
        errorLabel.setStyle("-fx-text-fill: red;");
        errorLabel.setText("✗ " + message);
    }

    private void showSuccess(String message) {
        errorLabel.setStyle("-fx-text-fill: green;");
        errorLabel.setText("✓ " + message);
    }

    private void navigateToDashboard() {
        System.out.println("Navigate to Dashboard");
        Scene scene = SceneNavigator.getSceneFromNode(loginButton);
        SceneNavigator.loadScene(scene, "/fxml/main-window.fxml");
    }

    private void navigateToSignup() {
        System.out.println("Navigate to Signup");
        Scene scene = SceneNavigator.getSceneFromNode(signupButton);
        SceneNavigator.loadScene(scene, "/fxml/signup.fxml");
    }

    private void navigateToForgotPassword() {
        System.out.println("Navigate to Forgot Password");
        Scene scene = SceneNavigator.getSceneFromNode(forgotPasswordButton);
        SceneNavigator.loadScene(scene, "/fxml/forgot-password.fxml");
    }
}