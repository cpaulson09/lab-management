import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { openDb } from "./db/client";

const port = Number(process.env.PORT ?? 3000);
const { db } = openDb();

serve({ fetch: createApp({ db }).fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
