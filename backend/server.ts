import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./src/modules/auth/routes/index.js";
import { usersRoutes } from "./src/modules/users/routes/index.js";
import { projectsRoutes } from "./src/modules/projects/routes/index.js";
import { analysesRoutes } from "./src/modules/analyses/routes/index.js";
import { errorHandler } from "./src/infra/errors.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "efficiencia-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/analyses", analysesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Rodando em http://localhost:${PORT}`);
  console.log(`CORS liberado para: ${FRONTEND_URL}`);
});
