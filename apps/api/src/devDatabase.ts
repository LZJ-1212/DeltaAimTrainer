import { startEmbeddedPostgres } from "./embeddedPostgres";

await startEmbeddedPostgres();
console.log("postgres ready on 127.0.0.1:54329/delta_aim");
await new Promise(() => undefined);
