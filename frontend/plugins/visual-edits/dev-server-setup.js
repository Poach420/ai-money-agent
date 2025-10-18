// dev-server-setup.js
// Dev server middleware configuration for visual editing
const fs = require("fs");
const path = require("path");
const express = require("express");
const { execSync } = require("child_process");

// 🔍 Read Supervisor code-server password from conf.d
function getCodeServerPassword() {
  try {
    const conf = fs.readFileSync(
      "/etc/supervisor/conf.d/supervisord_code_server.conf",
      "utf8",
    );

    // Match environment=PASSWORD="value"
    const match = conf.match(/PASSWORD="([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const SUP_PASS = getCodeServerPassword();

// Dev server setup function
function setupDevServer(config) {
  config.setupMiddlewares = (middlewares, devServer) => {
    if (!devServer) throw new Error("webpack-dev-server not defined");
    devServer.app.use(express.json());

    // ✅ CORS origin validation
    const isAllowedOrigin = (origin) => {
      if (!origin) return false;

      // Allow localhost and 127.0.0.1 on any port (for local dev)
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return true;
      }

      // Allow your live Render frontend and backend
      if (origin.match(/^https:\/\/ai-money-agent-frontend\.onrender\.com$/)) {
        return true;
      }
      if (origin.match(/^https:\/\/ai-money-agent-backend\.onrender\.com$/)) {
        return true;
      }

      // Allow all emergent.sh subdomains
      if (origin.match(/^https:\/\/([a-zA-Z0-9-]+\.)*emergent\.sh$/)) {
        return true;
      }

      // Allow all emergentagent.com subdomains
      if (origin.match(/^https:\/\/([a-zA-Z0-9-]+\.)*emergentagent\.com$/)) {
        return true;
      }

      // Allow all appspot.com subdomains (for App Engine)
      if (origin.match(/^https:\/\/([a-zA-Z0-9-]+\.)*appspot\.com$/)) {
        return true;
      }

      return false;
    };

    // ✅ Health check (no auth)
    devServer.app.get("/ping", (req, res) => {
      res.json({ status: "ok", time: new Date().toISOString() });
    });

    // ✅ Protected file editing endpoint with AST processing
    devServer.app.post("/edit-file", (req, res) => {
      // Validate and set CORS headers
      const origin = req.get("Origin");
      if (origin && isAllowedOrigin(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Headers", "Content-Type, x-api-key");
      }

      // 🔑 Check header against Supervisor password
      const key = req.get("x-api-key");
      if (!SUP_PASS || key !== SUP_PASS) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { changes } = req.body;

      if (!changes || !Array.isArray(changes) || changes.length === 0) {
        return res.status(400).json({ error: "No changes provided" });
      }

      try {
        const edits = [];
        const rejectedChanges = [];

        const changesByFile = {};
        changes.forEach((change) => {
          if (!changesByFile[change.fileName]) {
            changesByFile[change.fileName] = [];
          }
          changesByFile[change.fileName].push(change);
        });

        Object.entries(changesByFile).forEach(([fileName, fileChanges]) => {
          const frontendRoot = path.resolve(__dirname, '../..');

          const getRelativePath = (absolutePath) => {
            const rel = path.relative(frontendRoot, absolutePath);
            return '/' + rel;
          };

          const findFileRecursive = (dir, filename) => {
            try {
              const files = fs.readdirSync(dir, { withFileTypes: true });
              for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                  if (["node_modules", "public", ".git", "build", "dist", "coverage"].includes(file.name)) {
                    continue;
                  }
                  const found = findFileRecursive(fullPath, filename);
                  if (found) return found;
                } else if (file.isFile()) {
                  const fileBaseName = file.name.replace(/\.(js|jsx|ts|tsx)$/, "");
                  if (fileBaseName === filename) return fullPath;
                }
              }
            } catch (err) {}
            return null;
          };

          let targetFile = findFileRecursive(frontendRoot, fileName);
          if (!targetFile) {
            targetFile = path.resolve(frontendRoot, "src/components", `${fileName}.js`);
          }

          const normalizedTarget = path.normalize(targetFile);
          const isInFrontend = normalizedTarget.startsWith(frontendRoot) && !normalizedTarget.includes("..");
          const isNodeModules = normalizedTarget.includes("node_modules");
          const isPublic = normalizedTarget.includes("/public/") || normalizedTarget.endsWith("/public");

          if (!isInFrontend || isNodeModules || isPublic) {
            throw new Error(`Forbidden path for file ${fileName}`);
          }

          const parser = require("@babel/parser");
          const traverse = require("@babel/traverse").default;
          const generate = require("@babel/generator").default;
          const t = require("@babel/types");

          if (!fs.existsSync(targetFile)) throw new Error(`File not found: ${targetFile}`);

          const currentContent = fs.readFileSync(targetFile, "utf8");
          const ast = parser.parse(currentContent, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
          });

          traverse(ast, {});
          const { code } = generate(ast, { retainLines: true, comments: true });

          const backupFile = targetFile + ".backup";
          if (fs.existsSync(targetFile)) {
            const originalContent = fs.readFileSync(targetFile, "utf8");
            fs.writeFileSync(backupFile, originalContent, "utf8");
          }

          fs.writeFileSync(targetFile, code, "utf8");

          const timestamp = Date.now();
          try {
            execSync(`git -c user.name="visual-edit" -c user.email="support@emergent.sh" add "${targetFile}"`);
            execSync(`git -c user.name="visual-edit" -c user.email="support@emergent.sh" commit -m "visual_edit_${timestamp}"`);
          } catch (gitError) {
            console.error(`Git commit failed: ${gitError.message}`);
          }

          if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
        });

        const response = { status: "ok", edits: [] };
        if (rejectedChanges.length > 0) response.rejectedChanges = rejectedChanges;
        res.json(response);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // OPTIONS handler for CORS preflight
    devServer.app.options("/edit-file", (req, res) => {
      const origin = req.get("Origin");
      if (origin && isAllowedOrigin(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, x-api-key");
        res.sendStatus(200);
      } else {
        res.sendStatus(403);
      }
    });

    return middlewares;
  };
  return config;
}

module.exports = setupDevServer;
