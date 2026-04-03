package com.aiexplorer.controller;

import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.util.ValidationUtil;
import com.aiexplorer.util.SceneNavigator;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

public class ForgotPasswordController {

    @FXML private TextField emailField;
    @FXML private PasswordField newPasswordField;
    @FXML private PasswordField confirmPasswordField;
    @FXML private Button resetButton;
    @FXML private Label errorLabel;
    @FXML private Button backButton;
    @FXML private VBox newPasswordBox;
    @FXML private VBox confirmPasswordBox;

    private DatabaseService dbService = DatabaseService.getInstance();
    private boolean emailVerified = false;

    @FXML
    public void initialize() {
        setStep(1);
    }

    private void setStep(int step) {
        if (step == 1) {
            emailVerified = false;
            emailField.setDisable(false);

            if (newPasswordBox != null) {
                newPasswordBox.setVisible(false);
                newPasswordBox.setManaged(false);
            }
            if (confirmPasswordBox != null) {
                confirmPasswordBox.setVisible(false);
                confirmPasswordBox.setManaged(false);
            }
            resetButton.setText("VERIFY EMAIL");
        } else {
            emailVerified = true;
            emailField.setDisable(true);

            if (newPasswordBox != null) {
                newPasswordBox.setVisible(true);
                newPasswordBox.setManaged(true);
            }
            if (confirmPasswordBox != null) {
                confirmPasswordBox.setVisible(true);
                confirmPasswordBox.setManaged(true);
            }
            resetButton.setText("RESET PASSWORD");
        }
    }

    // ADDED @FXML BACK IN
    @FXML
    private void handleResetPassword(ActionEvent event) {
        String email = emailField.getText().trim();

        if (!emailVerified) {
            if (!ValidationUtil.isValidEmail(email)) {
                showError("Please enter a valid email");
                return;
            }
            if (dbService.getUserByEmailOrUsername(email) == null) {
                showError("Email not found");
                return;
            }
            showSuccess("Email verified! Enter new password");
            setStep(2);
        }
        else {
            String newPassword = newPasswordField.getText();
            String confirmPassword = confirmPasswordField.getText();

            if (newPassword.isEmpty() || confirmPassword.isEmpty()) {
                showError("Please fill out both password fields");
                return;
            }

            if (!newPassword.equals(confirmPassword)) {
                showError("Passwords do not match");
                return;
            }

            if (newPassword.length() < 8) {
                showError("Password must be at least 8 characters");
                return;
            }

            if (dbService.updatePassword(email, newPassword)) {
                showSuccess("Password updated successfully!");
                clearFields();
                setStep(1);
                goToLogin(event);
            } else {
                showError("Failed to update password");
            }
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

    private void clearFields() {
        emailField.clear();
        newPasswordField.clear();
        confirmPasswordField.clear();
    }

    // ADDED @FXML BACK IN
    @FXML
    private void goToLogin(ActionEvent event) {
        Scene scene = SceneNavigator.getSceneFromNode((Node) event.getSource());
        SceneNavigator.loadScene(scene, "/fxml/login.fxml");
    }
}