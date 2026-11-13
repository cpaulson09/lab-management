import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

export function createApp() {
  const app = new Hono();

  app.use("/trpc/*", cors());
  app.use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
      createContext: () => createContext(),
    }),
  );

  return app;
}
