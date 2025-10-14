import express from "express";
import { createPerformanceRouter } from "./performance-router";

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(createPerformanceRouter());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  return app;
};

export default createApp;
