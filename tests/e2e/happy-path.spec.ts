import { test, expect } from "@playwright/test";

test("snowball queue length matches expected", async () => {
  const { buildQueue } = await import("../../src/controller/session");
  const q = buildQueue(["v1-A", "v1-B", "v1-C", "v1-D"], 5);
  expect(q).toHaveLength(7 * 5 * 2);
  expect(q[0]).toMatchObject({ phase: "listen", chunkIds: ["v1-A"] });
  expect(q.at(-1)).toMatchObject({ phase: "repeat", chunkIds: ["v1-A", "v1-B", "v1-C", "v1-D"] });
});
