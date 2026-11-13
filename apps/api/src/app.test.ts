import { describe, expect, it } from "vitest";
import { createTestCaller } from "../test/createTestCaller";
import { createTestDb } from "../test/createTestDb";
import { createApp } from "./app";

describe("health", () => {
  it("answers through the tRPC caller", async () => {
    const { caller } = createTestCaller();
    await expect(caller.health()).resolves.toEqual({ status: "ok" });
  });

  it("answers over HTTP", async () => {
    const res = await createApp({ db: createTestDb() }).request("/trpc/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { result: { data: unknown } };
    expect(body.result.data).toEqual({ status: "ok" });
  });
});
