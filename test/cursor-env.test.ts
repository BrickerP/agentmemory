import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// @ts-expect-error -- plain .mjs integration script without type declarations
import { authHeader, parseEnvFile } from "../integrations/cursor/_env.mjs";

describe("cursor integration env file", () => {
  it("strips quotes and inline comments like the daemon", () => {
    const dir = mkdtempSync(join(tmpdir(), "am-cursor-env-"));
    const file = join(dir, ".env");
    writeFileSync(
      file,
      [
        'AGENTMEMORY_URL="http://localhost:3111"',
        "AGENTMEMORY_SECRET='abc'",
        "AGENTMEMORY_TOOLS=all # every tool",
        "export EXTRA=1",
      ].join("\n"),
    );
    try {
      expect(parseEnvFile(file)).toEqual({
        AGENTMEMORY_URL: "http://localhost:3111",
        AGENTMEMORY_SECRET: "abc",
        AGENTMEMORY_TOOLS: "all",
        EXTRA: "1",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("omits the bearer header for a keyless daemon", () => {
    expect(authHeader("")).toEqual({});
    expect(authHeader("abc")).toEqual({ Authorization: "Bearer abc" });
  });
});
