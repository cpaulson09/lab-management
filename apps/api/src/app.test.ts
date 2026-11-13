import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";
import { createCallerFactory } from "./trpc/trpc";

describe("health", () => {
  it("answers through the tRPC caller", async () => {
    const caller = createCallerFactory(appRouter)(createContext());
    await expect(caller.health()).resolves.toEqual({ status: "ok" });
  });

  it("answers over HTTP", async () => {
    const res = await createApp().request("/trpc/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result: { data: unknown } };
    expect(body.result.data).toEqual({ status: "ok" });
  });
});
