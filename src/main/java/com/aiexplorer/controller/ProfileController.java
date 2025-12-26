package com.aiexplorer.controller;

import com.aiexplorer.model.User;
import com.aiexplorer.service.SessionManager;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import java.time.format.DateTimeFormatter;

public class ProfileController {
    @FXML private Label fullNameLabel;
    @FXML private Label emailLabel;
    @FXML private Label usernameLabel;
    @FXML private Label joinDateLabel;
    @FXML private Button closeButton;
    @FXML private Button changePictureButton;
    @FXML private Button editProfileButton;
    @FXML private Button changePasswordButton;

    @FXML
    public void initialize() {
        loadUserProfile();
        changePasswordButton.setOnAction(e -> openChangePasswordWindow());
        editProfileButton.setOnAction(e -> System.out.println("Edit Profile Clicked (Not Implemented)"));
        changePictureButton.setOnAction(e -> System.out.println("Change Picture Clicked (Not Implemented)"));
        closeButton.setOnAction(e -> {
            closeButton.getScene().getWindow().hide();
        });
    }

    private void loadUserProfile() {
        User user = SessionManager.getInstance().getCurrentUser();
        if (user != null) {
            fullNameLabel.setText(user.getFullName());
            emailLabel.setText(user.getEmail());
            usernameLabel.setText(user.getUsername());

            if (user.getCreatedAt() != null) {
                String date = user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
                joinDateLabel.setText(date);
            }
        } else {
            fullNameLabel.setText("Guest User");
            emailLabel.setText("N/A");
            usernameLabel.setText("N/A");
            joinDateLabel.setText("N/A");
        }
    }

    private void openChangePasswordWindow() {
        System.out.println("Opening Change Password Window...");
        System.out.println("Change Password Clicked. You need to create change-password.fxml");
    }
}