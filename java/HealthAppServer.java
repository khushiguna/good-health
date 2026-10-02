package java_server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * HealthAppServer
 * Standalone Java HTTP Server for "Good Health and Well-Being"
 * Provides static web serving and REST API endpoints (/api/tips, /api/contact, /api/health-check).
 * Requires zero external dependencies (uses standard Java HTTP Server).
 */
public class HealthAppServer {

    private static final int DEFAULT_PORT = 8080;
    private static Path rootDirectory;

    public static void main(String[] args) throws IOException {
        int port = DEFAULT_PORT;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.trim().isEmpty()) {
            try {
                port = Integer.parseInt(portEnv.trim());
            } catch (NumberFormatException ignored) {}
        }

        // Determine workspace root containing HTML/CSS/JS files
        // If run from project root or inside java folder, detect correctly
        Path currentDir = Paths.get(".").toAbsolutePath().normalize();
        if (Files.exists(currentDir.resolve("index.html"))) {
            rootDirectory = currentDir;
        } else if (Files.exists(currentDir.getParent().resolve("index.html"))) {
            rootDirectory = currentDir.getParent();
        } else {
            rootDirectory = currentDir;
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(10));

        // REST API endpoints
        server.createContext("/api/tips", new TipsApiHandler());
        server.createContext("/api/contact", new ContactApiHandler());
        server.createContext("/api/health-check", new HealthCheckHandler());

        // Static files handler (serves HTML, CSS, JS)
        server.createContext("/", new StaticFileHandler(rootDirectory));

        server.start();

        System.out.println("==================================================================");
        System.out.println(" 🌱 Good Health and Well-Being Server Started Successfully!");
        System.out.println(" 🌐 Server URL: http://localhost:" + port);
        System.out.println(" 📁 Serving web assets from: " + rootDirectory);
        System.out.println(" 📡 Available Endpoints:");
        System.out.println("    - GET  /                  (Home Page)");
        System.out.println("    - GET  /api/health-check  (Server status)");
        System.out.println("    - GET  /api/tips          (Daily health tips JSON)");
        System.out.println("    - POST /api/contact       (Submit user feedback)");
        System.out.println("==================================================================");
    }

    /**
     * Handler to serve static web files (HTML, CSS, JS, images)
     */
    static class StaticFileHandler implements HttpHandler {
        private final Path webRoot;

        public StaticFileHandler(Path webRoot) {
            this.webRoot = webRoot;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            
            // Clean and decode path
            String decodedPath = URLDecoder.decode(pathStr, StandardCharsets.UTF_8.name());
            if (decodedPath.equals("/") || decodedPath.isEmpty()) {
                decodedPath = "/index.html";
            }

            // Security check against directory traversal
            Path resolvedPath = webRoot.resolve(decodedPath.substring(1)).normalize();
            if (!resolvedPath.startsWith(webRoot) || !Files.exists(resolvedPath) || Files.isDirectory(resolvedPath)) {
                String notFound = "<h1>404 Not Found</h1><p>The requested health page was not found.</p>";
                byte[] bytes = notFound.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
                return;
            }

            // Determine MIME type
            String mimeType = getMimeType(resolvedPath.toString());
            byte[] fileBytes = Files.readAllBytes(resolvedPath);

            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            exchange.sendResponseHeaders(200, fileBytes.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private String getMimeType(String filename) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".ico")) return "image/x-icon";
            return "application/octet-stream";
        }
    }

    /**
     * REST API Handler for Daily Tips (/api/tips)
     */
    static class TipsApiHandler implements HttpHandler {
        private final List<String> tips = Arrays.asList(
            "{\"id\":1,\"category\":\"Hydration\",\"icon\":\"💧\",\"tip\":\"Drink at least 8 glasses of pure water today to keep cells hydrated and energized.\"}",
            "{\"id\":2,\"category\":\"Exercise\",\"icon\":\"🏃\",\"tip\":\"Take a brisk 20-minute outdoor walk. Natural sunlight stimulates serotonin and vitamin D.\"}",
            "{\"id\":3,\"category\":\"Nutrition\",\"icon\":\"🥗\",\"tip\":\"Eat a rainbow plate: Include 2 colorful vegetables and whole fruits with lunch and dinner.\"}",
            "{\"id\":4,\"category\":\"Mental Well-Being\",\"icon\":\"🧘\",\"tip\":\"Practice 3 slow belly breaths when stress rises. Inhale 4s, hold 7s, exhale 8s.\"}",
            "{\"id\":5,\"category\":\"Sleep\",\"icon\":\"🌙\",\"tip\":\"Disconnect from smartphones and bright screens 60 minutes before bedtime for restorative REM rest.\"}",
            "{\"id\":6,\"category\":\"Daily Habits\",\"icon\":\"✨\",\"tip\":\"Adopt habit stacking: Pair your morning cup of tea with drinking a glass of fresh water.\"}"
        );

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < tips.size(); i++) {
                json.append(tips.get(i));
                if (i < tips.size() - 1) json.append(",");
            }
            json.append("]");

            byte[] bytes = json.toString().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    /**
     * REST API Handler for Contact & Feedback Submission (/api/contact)
     */
    static class ContactApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            // Read request body
            InputStream is = exchange.getRequestBody();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            String body = baos.toString(StandardCharsets.UTF_8.name());

            System.out.println("[API Contact Received]: " + body);

            String timeStamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX").format(new Date());
            String responseJson = "{\"status\":\"success\",\"message\":\"Thank you! Your wellness feedback was received.\",\"timestamp\":\"" + timeStamp + "\"}";

            byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    /**
     * REST API Handler for Health Check (/api/health-check)
     */
    static class HealthCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"UP\",\"application\":\"Good Health and Well-Being Server\",\"version\":\"1.0.0\"}";
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }
}
