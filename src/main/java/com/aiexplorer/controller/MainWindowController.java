package com.aiexplorer.controller;

import javafx.animation.FadeTransition;
import javafx.beans.property.SimpleStringProperty;
import javafx.concurrent.Task;
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
    @FXML private BorderPane mainBorderPane;
    @FXML private TreeView<String> folderTreeView;
    @FXML private TableView<FileItem> fileTableView;
    @FXML private TableColumn<FileItem, String> nameColumn;
    @FXML private TableColumn<FileItem, String> genreColumn;
    @FXML private TableColumn<FileItem, String> dateColumn;
    @FXML private TextField searchBar;
    @FXML private Label currentPathLabel;
    @FXML private Label statusLabel;
    @FXML private Button backButton;
    @FXML private Button forwardButton;
    @FXML private Button upButton;
    @FXML private Button refreshButton;
    @FXML private Button newFolderButton;
    @FXML private Button homeButton;
    @FXML private Button profileButton;
    @FXML private Button addFilesButton;
    @FXML private Button analyzeButton;
    @FXML private ProgressBar progressBar;

    @FXML private Button selectedFilesButton;
    @FXML private VBox bookmarksContainer;
    @FXML private Button discoveryModeButton;
    @FXML private Button visualizerButton; // In sidebar
    @FXML private VBox emptyStatePanel;
    @FXML private VBox analysisResultsPanel;
    @FXML private Label totalFilesLabel;
    @FXML private Label genreCountLabel;
    @FXML private VBox genresContent;
    @FXML private Button visualizeButton; // In results panel
    @FXML private Button switchDiscoveryButton;
    @FXML private Label selectionLabel;

    private File currentDirectory;
    private List<File> navigationHistory = new ArrayList<>();
    private List<FileItem> allAnalyzedFiles = new ArrayList<>();
    private int historyIndex = -1;
    private ExecutorService executorService = Executors.newSingleThreadExecutor();
    private Task<?> currentAnalysisTask = null;

    @FXML
    public void initialize() {
        setupFileTable();
        setupTreeView();
        setupSearchBar();
        setupToolbar();
        navigateToHome();
        updateStatusBar();
        showEmptyState();
        visualizerButton.setOnAction(e -> System.out.println("Visualizer clicked"));
        discoveryModeButton.setOnAction(e -> System.out.println("Discovery clicked"));
    }

    private void setupFileTable() {
        nameColumn.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().name));
        genreColumn.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().genre));
        dateColumn.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().date));

        fileTableView.setOnMouseClicked(e -> {
            if (e.getClickCount() == 2) {
                FileItem selected = fileTableView.getSelectionModel().getSelectedItem();
                if (selected != null) {
                    File file = new File(selected.fullPath);
                    if (selected.isDirectory) navigateToDirectory(file);
                    else openFile(file);
                }
            }
        });

        fileTableView.getSelectionModel().selectedItemProperty().addListener((obs, old, newSelection) -> {
            int count = fileTableView.getSelectionModel().getSelectedItems().size();
            selectionLabel.setText(count + " files selected");
        });

        FadeTransition fadeIn = new FadeTransition(Duration.millis(400), fileTableView);
        fadeIn.setFromValue(0.5);
        fadeIn.setToValue(1);
        fadeIn.play();
    }

    private void setupTreeView() {
        TreeItem<String> root = new TreeItem<>("💻 This PC");
        root.setExpanded(true);
        String userHome = System.getProperty("user.home");
        addTreeItem(root, "🏠 Home", new File(userHome));
        addTreeItem(root, "🖥️ Desktop", new File(userHome, "Desktop"));
        addTreeItem(root, "📥 Downloads", new File(userHome, "Downloads"));
        folderTreeView.setRoot(root);
        folderTreeView.setShowRoot(true);
    }

    private void addTreeItem(TreeItem<String> parent, String name, File path) {
        TreeItem<String> item = new TreeItem<>(name);
        parent.getChildren().add(item);
    }

    private void setupSearchBar() {
        searchBar.setPromptText("🔍 Search files...");
    }

    private void setupToolbar() {
        backButton.setOnAction(e -> navigateBack());
        forwardButton.setOnAction(e -> navigateForward());
        upButton.setOnAction(e -> navigateUp());
        refreshButton.setOnAction(e -> refreshCurrentDirectory());
        newFolderButton.setOnAction(e -> createNewFolder());
        homeButton.setOnAction(e -> handleHomeButton());
        profileButton.setOnAction(e -> handleProfileButton());
        addFilesButton.setOnAction(e -> addFilesForAnalysis());
        analyzeButton.setOnAction(e -> handleAnalyzeButtonClick());
    }

    @FXML
    private void handleAnalyzeButtonClick() {
        List<File> selectedFiles = getSelectedFiles();
        if (selectedFiles.isEmpty()) {
            showAlert("No Files Selected", "Please select files from the table to analyze", Alert.AlertType.WARNING);
            return;
        }

        analyzeButton.setDisable(true);
        statusLabel.setText("📊 Starting analysis...");
        progressBar.setVisible(true); // Make sure it's visible
        FileProcessingTask task = new FileProcessingTask(selectedFiles);
        progressBar.progressProperty().bind(task.progressProperty());
        statusLabel.textProperty().bind(task.messageProperty());

        task.setOnSucceeded(event -> {
            analyzeButton.setDisable(false);
            statusLabel.setText("✓ Analysis complete!");
            progressBar.progressProperty().unbind();
            progressBar.setVisible(false);

            List<File> analyzedFiles = getSelectedFiles();
            showAnalysisResults(analyzedFiles);
        });

        task.setOnFailed(event -> {
            analyzeButton.setDisable(false);
            statusLabel.setText("✗ Analysis failed");
            showAlert("Analysis Error", task.getException().getMessage(), Alert.AlertType.ERROR);
            progressBar.progressProperty().unbind();
            progressBar.setVisible(false);
        });

        currentAnalysisTask = task;
        executorService.execute(task);
    }

    private List<File> getSelectedFiles() {
        List<FileItem> items = new ArrayList<>(fileTableView.getSelectionModel().getSelectedItems());
        List<File> files = new ArrayList<>();
        for (FileItem item : items) {
            if (!item.isDirectory) { // Only analyze files
                files.add(new File(item.fullPath));
            }
        }
        return files;
    }

    private void addFilesForAnalysis() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Files for Analysis");
        List<File> files = fileChooser.showOpenMultipleDialog(addFilesButton.getScene().getWindow());

        if (files != null && !files.isEmpty()) {
            List<FileItem> newItems = new ArrayList<>();
            for (File file : files) {
                FileItem item = new FileItem(file.getName(), "Pending", formatDate(file.lastModified()),
                        file.getAbsolutePath(), false);
                if (!fileTableView.getItems().contains(item)) {
                    fileTableView.getItems().add(item);
                }
                newItems.add(item);
            }
            fileTableView.getSelectionModel().clearSelection();
            for(FileItem item : newItems) {
                fileTableView.getSelectionModel().select(item);
            }
            statusLabel.setText("Added " + files.size() + " file(s). Click Analyze.");
        }
    }

    private void handleHomeButton() { navigateToHome(); }
    private void handleProfileButton() { System.out.println("Profile clicked"); }

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
        currentPathLabel.setText(directory.getAbsolutePath());
        loadFilesIntoTable(directory);
        updateStatusBar();
    }

    private void navigateBack() {
        if (historyIndex > 0) {
            historyIndex--;
            File dir = navigationHistory.get(historyIndex);
            currentDirectory = dir;
            currentPathLabel.setText(dir.getAbsolutePath());
            loadFilesIntoTable(dir);
            updateStatusBar();
        }
    }

    private void navigateForward() {
        if (historyIndex < navigationHistory.size() - 1) {
            historyIndex++;
            File dir = navigationHistory.get(historyIndex);
            currentDirectory = dir;
            currentPathLabel.setText(dir.getAbsolutePath());
            loadFilesIntoTable(dir);
            updateStatusBar();
        }
    }

    private void navigateUp() {
        if (currentDirectory != null) {
            File parent = currentDirectory.getParentFile();
            if (parent != null) navigateToDirectory(parent);
        }
    }

    private void refreshCurrentDirectory() {
        if (currentDirectory != null) loadFilesIntoTable(currentDirectory);
    }

    private void loadFilesIntoTable(File directory) {
        List<FileItem> items = loadFilesFromDirectory(directory);
        fileTableView.getItems().setAll(items);
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

    private void createNewFolder() {
        TextInputDialog dialog = new TextInputDialog("New Folder");
        dialog.setTitle("Create New Folder");
        dialog.setHeaderText("Enter the name for the new folder:");
        dialog.setContentText("Name:");
        Optional<String> result = dialog.showAndWait();
        result.ifPresent(name -> {
            if (name.trim().isEmpty()) {
                showAlert("Invalid Name", "Folder name cannot be empty.", Alert.AlertType.WARNING);
                return;
            }
            if (currentDirectory == null || !currentDirectory.exists()) {
                showAlert("Error", "No valid directory selected.", Alert.AlertType.ERROR);
                return;
            }
            File newFolder = new File(currentDirectory, name.trim());
            if (newFolder.exists()) {
                showAlert("Error", "A folder with this name already exists.", Alert.AlertType.ERROR);
            }
            else {
                try {
                    if (newFolder.mkdir()) {
                        showAlert("Success", "Folder '" + name + "' created successfully.", Alert.AlertType.INFORMATION);
                        refreshCurrentDirectory(); // Refresh the file list to show the new folder
                    }
                    else {
                        showAlert("Error", "Failed to create folder. Please check permissions.", Alert.AlertType.ERROR);
                    }
                } catch (SecurityException e) {
                    showAlert("Security Error", "You do not have permission to create a folder here.", Alert.AlertType.ERROR);
                }
            }
        });
    }

    private void openFile(File file) {
        if (file == null || !file.exists()) {
            showAlert("Error", "The file does not exist.", Alert.AlertType.ERROR);
            return;
        }
        if (!java.awt.Desktop.isDesktopSupported()) {
            showAlert("Error", "Cannot open file: Desktop operations not supported on this system.", Alert.AlertType.ERROR);
            return;
        }

        java.awt.Desktop desktop = java.awt.Desktop.getDesktop();

        if (desktop.isSupported(java.awt.Desktop.Action.OPEN)) {
            try {
                desktop.open(file);
            } catch (IOException e) {
                showAlert("Error", "Could not open the file: " + e.getMessage(), Alert.AlertType.ERROR);
            } catch (SecurityException e) {
                showAlert("Security Error", "You do not have permission to open this file.", Alert.AlertType.ERROR);
            }
        } else {
            showAlert("Error", "Cannot open file: The 'OPEN' action is not supported.", Alert.AlertType.ERROR);
        }
    }
    private void updateStatusBar() {
        if (statusLabel != null && currentDirectory != null) {
            File[] files = currentDirectory.listFiles();
            statusLabel.setText("📂 " + (files != null ? files.length : 0) + " items");
        }
    }

    private void showEmptyState() {
        emptyStatePanel.setVisible(true);
        emptyStatePanel.setManaged(true);
        analysisResultsPanel.setVisible(false);
        analysisResultsPanel.setManaged(false);
    }

    private void showAnalysisResults(List<File> analyzedFiles) {
        totalFilesLabel.setText(String.valueOf(analyzedFiles.size()));

        genreCountLabel.setText("2"); // Mock
        genresContent.getChildren().clear(); // Clear old results
        genresContent.getChildren().add(new Label("• fiction (1 file)"));
        genresContent.getChildren().add(new Label("• document (1 file)"));

        emptyStatePanel.setVisible(false);
        emptyStatePanel.setManaged(false);
        analysisResultsPanel.setVisible(true);
        analysisResultsPanel.setManaged(true);
    }

    private void showAlert(String title, String message, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    public static class FileItem {
        public String name, genre, date, fullPath;
        public boolean isDirectory;
        public FileItem(String name, String genre, String date, String fullPath, boolean isDirectory) {
            this.name = name; this.genre = genre; this.date = date; this.fullPath = fullPath; this.isDirectory = isDirectory;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            FileItem fileItem = (FileItem) o;
            return Objects.equals(fullPath, fileItem.fullPath);
        }
        @Override
        public int hashCode() { return Objects.hash(fullPath); }
    }
}