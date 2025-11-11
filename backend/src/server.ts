import env from "./config/env";
import app from "./app";

const startServer = async () => {
  const port = env.port;

  app.listen(port, () => {
    console.log(`TailorTrack API listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

