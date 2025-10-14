/// <reference types="node" />
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);

if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Performance API mock listening on port ${port}`);
  });
}

export default createApp;
