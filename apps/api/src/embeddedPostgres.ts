import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = fileURLToPath(new URL("../.pgdata", import.meta.url));

export const EMBEDDED_PORT = 54329;
export const EMBEDDED_DATABASE = "delta_aim";

export function createEmbeddedPostgres(): EmbeddedPostgres {
  return new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "postgres",
    port: EMBEDDED_PORT,
    persistent: true,
    onLog: () => undefined,
  });
}

export async function startEmbeddedPostgres(): Promise<void> {
  const postgres = createEmbeddedPostgres();
  if (!existsSync(join(databaseDir, "PG_VERSION"))) {
    await postgres.initialise();
  }
  await postgres.start();
  try {
    await postgres.createDatabase(EMBEDDED_DATABASE);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists/i.test(message)) {
      throw error;
    }
  }
}
