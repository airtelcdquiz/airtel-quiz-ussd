// src/bootstrap/server.js
// Responsabilité unique : démarrer le serveur HTTP.

const app = require("./app");
const config = require("../config");

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`USSD API running on port ${config.port}`);
});

// arrêt propre (important en prod)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  server.close(() => process.exit(0));
});
