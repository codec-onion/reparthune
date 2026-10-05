import http from "http"
import { env } from "./config/env"
import { connectDB } from "./config/db"
import app from "./app"

connectDB()

const port = env.PORT;
app.set("port", port);

interface ListenError extends Error {
  syscall: string;
  code: string;
}

const errorHandler = (error: ListenError) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

server.listen(port);