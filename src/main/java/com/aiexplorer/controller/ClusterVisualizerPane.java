package com.aiexplorer.controller;

import javafx.animation.TranslateTransition;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.util.Duration;

import java.io.File;
import java.util.*;

public class ClusterVisualizerPane extends Pane {
    private final List<FileCluster> clusters = new ArrayList<>();
    private final Random random = new Random();

    public ClusterVisualizerPane() {
        setStyle("-fx-background-color: #1a1a1a;");
        setMinSize(800, 600);
    }

    public void visualizeFiles(List<File> files) {
        getChildren().clear();
        clusters.clear();
        if (files == null || files.isEmpty()) {
            showEmptyState();
            return;
        }
        Map<String, List<File>> grouped = groupFilesByType(files);
        grouped.forEach((type, fileList) -> {
            clusters.add(new FileCluster(type, fileList));
        });
        layoutAndDrawClusters();
    }


    private Map<String, List<File>> groupFilesByType(List<File> files) {
        Map<String, List<File>> groups = new HashMap<>();
        for (File file : files) {
            String type = getFileType(file);
            groups.computeIfAbsent(type, k -> new ArrayList<>()).add(file);
        }
        return groups;
    }

    private void layoutAndDrawClusters() {
        double centerX = getWidth() / 2;
        double centerY = getHeight() / 2;
        if (centerX == 0) centerX = 400;
        if (centerY == 0) centerY = 300;
        int clusterCount = clusters.size();
        double angleStep = (2 * Math.PI) / clusterCount;

        for (int i = 0; i < clusterCount; i++) {
            FileCluster cluster = clusters.get(i);
            double angle = i * angleStep;
            double radiusFromCenter = 150 + random.nextDouble() * 100;
            double x = centerX + Math.cos(angle) * radiusFromCenter;
            double y = centerY + Math.sin(angle) * radiusFromCenter;
            double size = 30 + Math.min(cluster.files.size() * 5, 70);
            drawClusterBubble(cluster, x, y, size, i);
        }
    }

    private void drawClusterBubble(FileCluster cluster, double x, double y, double size, int index) {
        Circle bubble = new Circle(x, y, size);

        Color[] colors = {
                Color.web("#7c3aed"),  // Purple
                Color.web("#2563eb"),  // Blue
                Color.web("#059669"),  // Green
                Color.web("#dc2626"),  // Red
                Color.web("#ea580c"),  // Orange
                Color.web("#0891b2"),  // Cyan
                Color.web("#9333ea"),  // Violet
                Color.web("#16a34a")   // Light Green
        };

        Color bubbleColor = colors[index % colors.length];
        bubble.setFill(Color.web(bubbleColor.toString(), 0.7));
        bubble.setStroke(bubbleColor);
        bubble.setStrokeWidth(2);

        bubble.setOnMouseEntered(e -> {
            bubble.setFill(Color.web(bubbleColor.toString(), 0.9));
            bubble.setScaleX(1.1);
            bubble.setScaleY(1.1);
        });

        bubble.setOnMouseExited(e -> {
            bubble.setFill(Color.web(bubbleColor.toString(), 0.7));
            bubble.setScaleX(1.0);
            bubble.setScaleY(1.0);
        });

        bubble.setOnMouseClicked(e -> {
            showClusterDetails(cluster);
        });

        Tooltip tooltip = new Tooltip(
                cluster.name + "\n" +
                        cluster.files.size() + " files\n" +
                        "Click to view details"
        );
        Tooltip.install(bubble, tooltip);

        Label label = new Label(cluster.name);
        label.setTextFill(Color.web("#e4e4e4"));
        label.setFont(Font.font("Segoe UI", FontWeight.BOLD, 11));
        label.setLayoutX(x - 30);
        label.setLayoutY(y - 8);
        label.setStyle("-fx-background-color: rgba(0, 0, 0, 0.6); -fx-padding: 2 6; -fx-background-radius: 3;");

        Label countLabel = new Label(String.valueOf(cluster.files.size()));
        countLabel.setTextFill(Color.WHITE);
        countLabel.setFont(Font.font("Segoe UI", FontWeight.BOLD, 14));
        countLabel.setLayoutX(x - 10);
        countLabel.setLayoutY(y + 10);

        TranslateTransition transition = new TranslateTransition(Duration.millis(500), bubble);
        transition.setFromY(-50);
        transition.setToY(0);
        transition.setDelay(Duration.millis(index * 50));
        transition.play();

        getChildren().addAll(bubble, label, countLabel);
    }

    private void showClusterDetails(FileCluster cluster) {
        StringBuilder details = new StringBuilder();
        details.append("Cluster: ").append(cluster.name).append("\n");
        details.append("Files: ").append(cluster.files.size()).append("\n\n");
        for (int i = 0; i < Math.min(5, cluster.files.size()); i++) details.append("• ").append(cluster.files.get(i).getName()).append("\n");
        if (cluster.files.size() > 5) details.append("... and ").append(cluster.files.size() - 5).append(" more");
        System.out.println(details.toString());
    }

    private void showEmptyState() {
        Label emptyLabel = new Label("No files to visualize\nAdd files to see clusters");
        emptyLabel.setTextFill(Color.web("#6e6e6e"));
        emptyLabel.setFont(Font.font("Segoe UI", 16));
        emptyLabel.setStyle("-fx-text-alignment: center;");
        emptyLabel.setLayoutX(300);
        emptyLabel.setLayoutY(250);
        getChildren().add(emptyLabel);
    }

    private String getFileType(File file) {
        if (file.isDirectory()) return "Folder";
        String name = file.getName();
        int lastDot = name.lastIndexOf('.');
        if (lastDot > 0) {
            return name.substring(lastDot + 1).toUpperCase();
        }
        return "Unknown";
    }

    private static class FileCluster {
        String name;
        List<File> files;

        FileCluster(String name, List<File> files) {
            this.name = name;
            this.files = files;
        }
    }

    private void drawConnectionLines() {
        for (int i = 0; i < clusters.size(); i++) {
            for (int j = i + 1; j < Math.min(i + 3, clusters.size()); j++) {
                javafx.scene.shape.Line line = new javafx.scene.shape.Line();
                line.setStroke(Color.web("#ffffff", 0.1));
                line.setStrokeWidth(1);
                getChildren().add(0, line);
            }
        }
    }

}