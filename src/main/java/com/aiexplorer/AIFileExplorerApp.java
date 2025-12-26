package com.aiexplorer;

import com.aiexplorer.service.DatabaseService;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.Objects;

public class AIFileExplorerApp extends Application {
    static {
        DatabaseService.getInstance();
    }

    @Override
    public void start(Stage primaryStage) {
        DatabaseService db = DatabaseService.getInstance();
        db.ensureLoginTablesExist();
        db.ensureFileTablesExist();

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/login.fxml"));
            Scene scene = new Scene(loader.load(), 900, 600);

            String css = Objects.requireNonNull(
                    getClass().getResource("/styles/auth-theme.css")
            ).toExternalForm();
            scene.getStylesheets().add(css);

            primaryStage.setTitle("Synonym - Intelligent File Discovery");
            primaryStage.setScene(scene);
            primaryStage.setMinWidth(800);
            primaryStage.setMinHeight(500);
            primaryStage.centerOnScreen();

            primaryStage.show();

            System.out.println("✓ Synonym application started successfully");

        } catch (IOException e) {
            System.err.println("✗ Error loading login page: " + e.getMessage());
            e.printStackTrace();
            showErrorDialog("Failed to load application", e.getMessage());
        } catch (NullPointerException e) {
            System.err.println("✗ Resource not found: " + e.getMessage());
            e.printStackTrace();
            showErrorDialog("Resource Missing", "FXML or CSS file not found. Please check resources folder.");
        }
    }

    private void showErrorDialog(String title, String message) {
        javafx.scene.control.Alert alert = new javafx.scene.control.Alert(
                javafx.scene.control.Alert.AlertType.ERROR
        );
        alert.setTitle(title);
        alert.setHeaderText("Application Error");
        alert.setContentText(message);
        alert.showAndWait();
    }

    @Override
    public void stop() {
        System.out.println("✓ Synonym application closed");
    }

    public static void main(String[] args) {
        try {
            com.aiexplorer.service.DatabaseService.getInstance();
            System.out.println("✓ Database initialized");
        } catch (Exception e) {
            System.err.println("✗ Database initialization failed: " + e.getMessage());
        }
        launch(args);
    }
}