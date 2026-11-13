import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createContainer } from "./container";
import type { Db } from "./db/client";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

export function createApp({ db }: { db: Db }) {
  const services = createContainer(db);
  const app = new Hono();

  app.use("/trpc/*", cors());
  app.use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
      createContext: () => createContext(services),
    }),
  );

  return app;
}
