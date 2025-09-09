import type { FileSystem, ConfigReader, BarrelConfigExports } from "./index.js";

class ExportTypeNotFound extends Error {
  name = "ExportTypeNotFound";
  message = "Check your package.json config";
}

export class BarrelBuilder {
  #fileSystem: FileSystem;
  #configReader: ConfigReader;

  constructor(fileSystem: FileSystem, configReader: ConfigReader) {
    this.#fileSystem = fileSystem;
    this.#configReader = configReader;
  }

  async run() {
    const config = this.#configReader.getConfig();
    if (config.exports.length === 0) return;

    await Promise.all(
      config.rootFolders.map((path) => this.#processFolder(path))
    )
      .then(() => console.log("Barrels generated successfully!"))
      .catch((err) => console.error("Error generating barrels:", err));
  }

  #processFolder(path: string) {
    const indexContent = [];
    const files = this.#fileSystem.readDir(path);
    const ignoreIndexFile = ["index.ts", "index.js"];

    const fileIndex = files.find(({ name }) => ignoreIndexFile.includes(name));
    if (!fileIndex) return false;

    for (const item of files) {
      if (ignoreIndexFile.includes(item.name)) continue;

      if (item.isDirectory()) {
        const hasIndex = this.#processFolder(
          this.#fileSystem.join(path, item.name)
        );
        if (hasIndex) indexContent.push(`export * from "./${item.name}";`);
        continue;
      }

      const exportConfig = this.#configReader
        .getConfig()
        .exports.filter(({ ext }) => item.name.endsWith(ext));
      if (exportConfig.length === 0) continue;

      exportConfig.forEach((config) => {
        const content = BarrelBuilderUtils.createExport(config, item.name);
        indexContent.push(content);
      });
    }
    if (indexContent.length === 0) return false;

    this.#fileSystem.writeFile(
      this.#fileSystem.join(path, fileIndex.name),
      indexContent.join("\n")
    );
    return true;
  }
}

class BarrelBuilderUtils {
  static #removeFileExtenstion(str: string) {
    const arr = str.split(".");
    return arr.slice(0, arr.length - 1).join(".");
  }

  static #transformFileNameTransform(
    config: BarrelConfigExports,
    fileName: string
  ) {
    let name = fileName;
    if (!config.fileNameTransform) return name;

    if (config.fileNameTransform.includes("RemoveExtension")) {
      name = this.#removeFileExtenstion(name);
    }

    return name;
  }

  static #transformExportTypeTransform(
    config: BarrelConfigExports,
    fileName: string
  ) {
    let name = this.#removeFileExtenstion(fileName);
    if (!config.exportTypeTransform) return name;

    // TODO loop on match pattern
    if (config.exportTypeTransform.includes("KebabCaseToCamelCase")) {
      name = this.#toCamelCase(name);
    }

    return name;
  }

  static #toCamelCase(str: string) {
    return str
      .split("-")
      .map((w) => w.at(0)?.toUpperCase() + w.slice(1))
      .join("");
  }

  static createExport(config: BarrelConfigExports, fileName: string) {
    if (!config.exportType) throw new ExportTypeNotFound();
    if (config.exportType === "all") {
      return `export * from "./${this.#transformFileNameTransform(
        config,
        fileName
      )}";`;
    }

    if (config.exportType === "default") {
      return `export { default as ${this.#transformExportTypeTransform(
        config,
        fileName
      )} } from "./${this.#transformFileNameTransform(config, fileName)}";`;
    }
  }
}
