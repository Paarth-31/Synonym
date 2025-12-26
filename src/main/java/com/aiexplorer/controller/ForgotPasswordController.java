package com.aiexplorer.controller;

import com.aiexplorer.service.DatabaseService;
import com.aiexplorer.util.ValidationUtil; // Using your util
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.VBox; // Import VBox

public class ForgotPasswordController {
    @FXML private AnchorPane root;
    @FXML private TextField emailField;
    @FXML private PasswordField newPasswordField;
    @FXML private PasswordField confirmPasswordField;
    @FXML private Button resetButton;
    @FXML private Label errorLabel; // Was messageLabel
    @FXML private Button backButton; // Was backToLoginLink

    @FXML private VBox newPasswordBox;
    @FXML private VBox confirmPasswordBox;

    private DatabaseService dbService = DatabaseService.getInstance();
    private boolean emailVerified = false;

    @FXML
    public void initialize() {
        setStep(1);

        resetButton.setOnAction(event -> handlePasswordReset());
        backButton.setOnAction(event -> navigateToLogin());
    }

    private void setStep(int step) {
        if (step == 1) {
            emailVerified = false;
            emailField.setDisable(false);
            newPasswordBox.setVisible(false);
            newPasswordBox.setManaged(false);
            confirmPasswordBox.setVisible(false);
            confirmPasswordBox.setManaged(false);
            resetButton.setText("VERIFY EMAIL");
        } else {
            emailVerified = true;
            emailField.setDisable(true); // Lock email field
            newPasswordBox.setVisible(true);
            newPasswordBox.setManaged(true);
            confirmPasswordBox.setVisible(true);
            confirmPasswordBox.setManaged(true);
            resetButton.setText("RESET PASSWORD");
        }
    }

    private void handlePasswordReset() {
        String email = emailField.getText().trim();

        if (!emailVerified) {
            if (!ValidationUtil.isValidEmail(email)) {
                showError("Please enter a valid email");
                return;
            }
            if (dbService.getUserByEmailOrUsername(email) == null) { // <-- THIS IS THE FIX
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

            if (newPassword.length() < 8) { // Use stronger validation
                showError("Password must be at least 8 characters");
                return;
            }

            if (dbService.updatePassword(email, newPassword)) {
                showSuccess("Password updated successfully!");
                clearFields();
                setStep(1);
                navigateToLogin();
            } else {
                showError("Failed to update password");
            }
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

    private void clearFields() {
        emailField.clear();
        newPasswordField.clear();
        confirmPasswordField.clear();
    }

    private void navigateToLogin() {
        System.out.println("Navigate to Login");
    }
}