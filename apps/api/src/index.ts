import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createApp } from "./createApp";
import { prisma } from "./db";
import { PrismaSessionRepository } from "./prismaSessionRepository";
import { createSessionService } from "./sessionService";

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT");
}

const apiRoot = fileURLToPath(new URL("..", import.meta.url));
const prismaCli = fileURLToPath(
  new URL("../../../node_modules/prisma/build/index.js", import.meta.url),
);

function migrateDeploy(): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [prismaCli, "migrate", "deploy"],
      { cwd: apiRoot },
      (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve();
      },
    );
  });
}

async function waitForDatabase(): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  const message = lastError instanceof Error ? lastError.message : "database";
  throw new Error(message);
}

await waitForDatabase();
await migrateDeploy();

const app = createApp(createSessionService(new PrismaSessionRepository(prisma)));
app.listen(port, () => {
  console.log(`api http://127.0.0.1:${port}`);
});
