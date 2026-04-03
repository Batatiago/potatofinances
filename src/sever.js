import "dotenv/config";
import app from "./app.js";
import { initDb } from "./database/init.js";

const port = process.env.PORT || 3001;

async function bootstrap() {
  await initDb();
  app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
  });
}

bootstrap();