import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "path";

export class FileSystem {
  readFile(path: string) {
    return readFileSync(path, { encoding: "utf-8" });
  }

  isExists(path: string) {
    return existsSync(path);
  }

  readDir(path: string) {
    return readdirSync(path, { withFileTypes: true });
  }

  getProjectBaseRoot() {
    return process.cwd();
  }

  writeFile(path: string, content: string) {
    return writeFileSync(path, content, { encoding: "utf-8" });
  }

  join(...args: Parameters<typeof join>) {
    return join(...args);
  }
}
