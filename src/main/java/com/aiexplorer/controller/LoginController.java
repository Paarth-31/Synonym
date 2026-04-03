package com.aiexplorer.controller;

import com.aiexplorer.model.User;
import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.service.SessionManager;
import com.aiexplorer.util.SceneNavigator;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;

public class LoginController {

    @FXML private TextField usernameField;
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
    }

    // ADDED @FXML BACK IN SO THE APP DOES NOT CRASH
    @FXML
    private void handleLogin(ActionEvent event) {
        String emailOrUsername = usernameField.getText().trim();
        String password = passwordField.getText();

        if (emailOrUsername.isEmpty() || password.isEmpty()) {
            showError("Username and password required");
            return;
        }

        loadingBar.setVisible(true);

        if (dbService.loginUser(emailOrUsername, password)) {
            User user = dbService.getUserByEmailOrUsername(emailOrUsername);
            if (user != null) {
                SessionManager.getInstance().setCurrentUser(user);
                showSuccess("Login successful!");
                navigateToDashboard(event);
            } else {
                showError("Could not find user details after login");
            }
        } else {
            showError("Invalid username or password");
        }
        loadingBar.setVisible(false);
    }

    private void showError(String message) {
        errorLabel.setStyle("-fx-text-fill: #ff5252;");
        errorLabel.setText(message);
    }

    private void showSuccess(String message) {
        errorLabel.setStyle("-fx-text-fill: #10b981;");
        errorLabel.setText(message);
    }

    private void navigateToDashboard(ActionEvent event) {
        Scene scene = SceneNavigator.getSceneFromNode((Node) event.getSource());
        SceneNavigator.loadScene(scene, "/fxml/main-window.fxml");
    }

    // ADDED @FXML BACK IN
    @FXML
    private void goToSignup(ActionEvent event) {
        Scene scene = SceneNavigator.getSceneFromNode((Node) event.getSource());
        SceneNavigator.loadScene(scene, "/fxml/signup.fxml");
    }

    // ADDED @FXML BACK IN
    @FXML
    private void goToForgotPassword(ActionEvent event) {
        Scene scene = SceneNavigator.getSceneFromNode((Node) event.getSource());
        SceneNavigator.loadScene(scene, "/fxml/forgot-password.fxml");
    }
}