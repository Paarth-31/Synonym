package com.aiexplorer.service;

import javafx.concurrent.Task;
import org.json.JSONObject;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class FileProcessingTask extends Task<Void> {
    private final List<File> files;
    private final DatabaseService dbService;

    // This is the path *inside* your JAR/resources
    private static final String PYTHON_SCRIPT_RESOURCE_PATH = "/firstrun.py";
    private static final String PYTHON_COMMAND = "python"; // Or "python3" if needed

    public FileProcessingTask(List<File> files) {
        this.files = files;
        this.dbService = DatabaseService.getInstance();
    }

    @Override
    protected Void call() throws Exception {
        Path scriptPath = null;
        try {
            // 1. Extract the script from resources to a temp file
            scriptPath = extractScript(PYTHON_SCRIPT_RESOURCE_PATH);

            int totalFiles = files.size();
            for (int i = 0; i < files.size(); i++) {
                if (isCancelled()) break;

                File file = files.get(i);
                updateMessage("Processing: " + file.getName());
                updateProgress(i, totalFiles);

                try {
                    // 2. Run the script using its absolute path
                    String jsonOutput = runPythonScript(scriptPath.toAbsolutePath().toString(), file);

                    if (jsonOutput.isEmpty()) {
                        System.err.println("✗ Python script produced no output for " + file.getName());
                        continue;
                    }

                    JSONObject result = new JSONObject(jsonOutput);
                    if (result.getBoolean("success")) {
                        saveAnalysisResults(result, file);
                    } else {
                        System.err.println("✗ Error processing " + file.getName() + ": " + result.getString("error"));
                    }

                } catch (Exception e) {
                    System.err.println("✗ Exception processing " + file.getName() + ": " + e.getMessage());
                    e.printStackTrace();
                }
                updateProgress(i + 1, totalFiles);
            }
        } finally {
            // 3. Clean up the temporary file
            if (scriptPath != null) {
                try {
                    Files.delete(scriptPath);
                } catch (IOException e) {
                    System.err.println("Warn: Could not delete temp script: " + e.getMessage());
                }
            }
        }

        updateMessage("Analysis Complete");
        return null;
    }

    /**
     * Extracts a resource from inside the JAR to a temporary file.
     * @param resourcePath The path to the resource (e.g., "/firstrun.py")
     * @return The Path to the created temporary file.
     * @throws IOException
     */
    private Path extractScript(String resourcePath) throws IOException {
        InputStream scriptStream = getClass().getResourceAsStream(resourcePath);
        if (scriptStream == null) {
            throw new FileNotFoundException("Cannot find script in resources: " + resourcePath);
        }

        // Create a temp file with a .py extension
        Path tempScript = Files.createTempFile("aiexplorer_script", ".py");

        // Copy the script from resources to the temp file
        Files.copy(scriptStream, tempScript, StandardCopyOption.REPLACE_EXISTING);

        // Optional: Make the script executable (useful on Linux/macOS)
        tempScript.toFile().setExecutable(true);

        return tempScript;
    }

    /**
     * Runs the Python script using its absolute path.
     * @param absoluteScriptPath The full, absolute path to the extracted .py file
     * @param fileToAnalyze The file to be processed
     * @return The JSON output string from the script
     * @throws IOException
     */
    private String runPythonScript(String absoluteScriptPath, File fileToAnalyze) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                PYTHON_COMMAND,
                absoluteScriptPath,
                fileToAnalyze.getAbsolutePath()
        );

        // No need to set directory, we are using absolute paths
        Process process = pb.start();

        // (The stream reading logic is the same as before)
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) output.append(line).append("\n");
        }

        StringBuilder errors = new StringBuilder();
        try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = errorReader.readLine()) != null) errors.append(line).append("\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) System.err.println("[PYTHON SCRIPT FAILED] Exit Code: " + exitCode);
        if (errors.length() > 0) System.err.println("[PYTHON ERROR] " + errors.toString());

        // Find the last valid JSON line
        String lastJsonLine = "";
        for (String line : output.toString().split("\n")) {
            if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
                lastJsonLine = line.trim();
            }
        }
        return lastJsonLine;
    }

    /**
     * Helper method to save results to the database.
     */
    private void saveAnalysisResults(JSONObject result, File file) {
        String filename = result.getString("filename");
        double confidence = result.getDouble("confidence");
        String topGenre = result.getString("top_genre");
        double topGenreScore = result.getDouble("top_genre_score");

        JSONObject keywordsObj = result.getJSONObject("keywords");
        StringBuilder keywords = new StringBuilder();
        for (String key : keywordsObj.keySet()) {
            keywords.append(key).append(", ");
        }
        if (keywords.length() > 0) keywords.setLength(keywords.length() - 2);

        boolean saved = dbService.saveOrUpdateFileAnalysis(
                filename,
                keywords.toString(),
                topGenre,
                topGenreScore,
                file.getAbsolutePath(),
                confidence
        );

        if (saved) System.out.println("✓ Saved to database: " + filename);
    }
}