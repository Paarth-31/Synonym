package com.aiexplorer.controller;

import javafx.animation.FadeTransition;
import javafx.beans.property.SimpleStringProperty;
import javafx.concurrent.Task;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.util.Duration;
import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import com.aiexplorer.service.FileProcessingTask;

public class MainWindowController {

    public static class FileItem {
        public String name, genre, date, fullPath;
        public boolean isDirectory;
        public FileItem(String name, String genre, String date, String fullPath, boolean isDirectory) {
            this.name = name; this.genre = genre; this.date = date; this.fullPath = fullPath; this.isDirectory = isDirectory;
        }
    }

    @FXML private Button homeButton;
    @FXML private Button profileButton;
    @FXML private TextField pathField;
    @FXML private TextField searchField;
    @FXML private TreeView<String> directoryTree;

    @FXML private TableView<FileItem> fileTable;
    @FXML private TableColumn<FileItem, String> nameCol;
    @FXML private TableColumn<FileItem, String> genreCol;
    @FXML private TableColumn<FileItem, String> dateCol;

    @FXML private Button addFilesBtn;
    @FXML private Button analyzeBtn;
    @FXML private Button selectedFilesBtn;
    @FXML private Button discoveryBtn;
    @FXML private Button visualizerBtn;

    @FXML private Label totalFilesLabel;
    @FXML private Label totalGenresLabel;
    @FXML private VBox genreListContainer;

    private File currentDirectory;
    private List<File> navigationHistory = new ArrayList<>();
    private int historyIndex = -1;
    private ExecutorService executorService = Executors.newSingleThreadExecutor();

    // Map to link TreeView display names to actual system paths
    private Map<String, String> treePathMap = new HashMap<>();

    @FXML
    public void initialize() {
        setupFileTable();
        setupTreeView();
        searchField.setPromptText("Search files...");
        navigateToHome();
    }

    private void setupFileTable() {
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().name));
        genreCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().genre));
        dateCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().date));

        fileTable.setOnMouseClicked(e -> {
            if (e.getClickCount() == 2) {
                FileItem selected = fileTable.getSelectionModel().getSelectedItem();
                if (selected != null) {
                    File file = new File(selected.fullPath);
                    if (selected.isDirectory) navigateToDirectory(file);
                    else openFile(file);
                }
            }
        });

        FadeTransition fadeIn = new FadeTransition(Duration.millis(400), fileTable);
        fadeIn.setFromValue(0.5);
        fadeIn.setToValue(1);
        fadeIn.play();
    }

    private void setupTreeView() {
        TreeItem<String> root = new TreeItem<>("This PC");
        root.setExpanded(true);
        String userHome = System.getProperty("user.home");

        // Core user directories
        addTreeItem(root, "Home", userHome);
        addTreeItem(root, "Desktop", userHome + File.separator + "Desktop");
        addTreeItem(root, "Documents", userHome + File.separator + "Documents");
        addTreeItem(root, "Downloads", userHome + File.separator + "Downloads");
        addTreeItem(root, "Pictures", userHome + File.separator + "Pictures");
        addTreeItem(root, "Videos", userHome + File.separator + "Videos");

        // Automatically detect all system drives (C:\, D:\, etc.)
        for (File drive : File.listRoots()) {
            addTreeItem(root, drive.getAbsolutePath(), drive.getAbsolutePath());
        }

        directoryTree.setRoot(root);
        directoryTree.setShowRoot(true);

        directoryTree.getSelectionModel().selectedItemProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue != null) {
                String path = treePathMap.get(newValue.getValue());
                if (path != null) {
                    navigateToDirectory(new File(path));
                }
            }
        });
    }

    private void addTreeItem(TreeItem<String> parent, String displayName, String fullPath) {
        // Only add the item if the directory actually exists on the user's OS
        File fileCheck = new File(fullPath);
        if (fileCheck.exists()) {
            TreeItem<String> item = new TreeItem<>(displayName);
            parent.getChildren().add(item);
            treePathMap.put(displayName, fullPath);
        }
    }

    @FXML
    private void handleHomeButton(ActionEvent event) {
        navigateToHome();
    }

    @FXML
    private void handleProfileButton(ActionEvent event) {
        showAlert("Profile", "Profile functionality coming soon!", Alert.AlertType.INFORMATION);
    }

    @FXML
    private void handleAnalyze(ActionEvent event) {
        List<File> selectedFiles = getSelectedFiles();
        if (selectedFiles.isEmpty()) {
            showAlert("No Files Selected", "Please select files from the table to analyze.", Alert.AlertType.WARNING);
            return;
        }

        analyzeBtn.setDisable(true);
        FileProcessingTask task = new FileProcessingTask(selectedFiles);

        task.setOnSucceeded(e -> {
            analyzeBtn.setDisable(false);
            List<File> analyzedFiles = getSelectedFiles();
            showAnalysisResults(analyzedFiles);
        });

        task.setOnFailed(e -> {
            analyzeBtn.setDisable(false);
            showAlert("Analysis Error", task.getException().getMessage(), Alert.AlertType.ERROR);
        });

        executorService.execute(task);
    }

    private List<File> getSelectedFiles() {
        List<FileItem> items = new ArrayList<>(fileTable.getSelectionModel().getSelectedItems());
        List<File> files = new ArrayList<>();
        for (FileItem item : items) {
            if (!item.isDirectory) {
                files.add(new File(item.fullPath));
            }
        }
        return files;
    }

    @FXML
    private void handleAddFiles(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Files for Analysis");
        List<File> files = fileChooser.showOpenMultipleDialog(addFilesBtn.getScene().getWindow());

        if (files != null && !files.isEmpty()) {
            List<FileItem> newItems = new ArrayList<>();
            for (File file : files) {
                FileItem item = new FileItem(file.getName(), "Pending", formatDate(file.lastModified()),
                        file.getAbsolutePath(), false);
                if (!fileTable.getItems().contains(item)) {
                    fileTable.getItems().add(item);
                }
                newItems.add(item);
            }
            fileTable.getSelectionModel().clearSelection();
            for(FileItem item : newItems) {
                fileTable.getSelectionModel().select(item);
            }
        }
    }

    private void navigateToHome() {
        navigateToDirectory(new File(System.getProperty("user.home")));
    }

    private void navigateToDirectory(File directory) {
        if (directory == null || !directory.exists() || !directory.isDirectory()) return;
        if (historyIndex < navigationHistory.size() - 1) {
            navigationHistory.subList(historyIndex + 1, navigationHistory.size()).clear();
        }
        navigationHistory.add(directory);
        historyIndex = navigationHistory.size() - 1;

        currentDirectory = directory;
        pathField.setText(directory.getAbsolutePath());
        loadFilesIntoTable(directory);
    }

    private void loadFilesIntoTable(File directory) {
        List<FileItem> items = loadFilesFromDirectory(directory);
        fileTable.getItems().setAll(items);
    }

    private List<FileItem> loadFilesFromDirectory(File directory) {
        List<FileItem> items = new ArrayList<>();
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                try {
                    String name = file.getName();
                    String genre = file.isDirectory() ? "Folder" : "File";
                    String date = formatDate(file.lastModified());
                    items.add(new FileItem(name, genre, date, file.getAbsolutePath(), file.isDirectory()));
                } catch (Exception ignored) {}
            }
        }
        return items;
    }

    private String formatDate(long timestamp) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
        LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
        return formatter.format(dateTime);
    }

    private void openFile(File file) {
        if (file == null || !file.exists()) return;
        if (!java.awt.Desktop.isDesktopSupported()) {
            showAlert("Error", "Desktop operations not supported.", Alert.AlertType.ERROR);
            return;
        }
        try {
            java.awt.Desktop.getDesktop().open(file);
        } catch (IOException | SecurityException e) {
            showAlert("Error", "Could not open the file.", Alert.AlertType.ERROR);
        }
    }

    private void showAnalysisResults(List<File> analyzedFiles) {
        totalFilesLabel.setText(String.valueOf(analyzedFiles.size()));
        totalGenresLabel.setText("2");
        genreListContainer.getChildren().clear();

        Label genre1 = new Label("• fiction (1 file)");
        genre1.setStyle("-fx-text-fill: #f8fafc;");
        Label genre2 = new Label("• document (1 file)");
        genre2.setStyle("-fx-text-fill: #f8fafc;");

        genreListContainer.getChildren().addAll(genre1, genre2);
    }

    private void showAlert(String title, String message, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    @FXML private void handleDiscoveryMode(ActionEvent event) { System.out.println("Discovery clicked"); }
    @FXML private void handleVisualizer(ActionEvent event) { System.out.println("Visualizer clicked"); }
}