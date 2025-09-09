import type { FileSystem } from "./file-system";

export type FileExtension = string;
export type FileNameTransform = "RemoveExtension"[];
export type ExportType = "all" | "default";
export type ExportTypeTransform = "KebabCaseToCamelCase"[];
export type BarrelConfigExports = {
  ext: string;
  fileNameTransform?: FileNameTransform;
  exportType: ExportType;
  exportTypeTransform?: ExportTypeTransform;
};

export type BarrelConfig = {
  rootFolders: string[];
  exports: BarrelConfigExports[];
};

class ConfigNotFound extends Error {
  name = "ConfigNotFound";
  message = "Add barrel.gk config in your package.json";
}

export class ConfigReader {
  #fileSystem: FileSystem;
  #config: BarrelConfig = {
    rootFolders: [],
    exports: [],
  };

  constructor(fileSystem: FileSystem) {
    this.#fileSystem = fileSystem;

    const path = this.#fileSystem.join(
      this.#fileSystem.getProjectBaseRoot(),
      "package.json"
    );
    const packageJSON = this.#fileSystem.readFile(path);
    const config = JSON.parse(packageJSON)["barrel.gk"] as BarrelConfig;
    if (!config) throw new ConfigNotFound();

    this.#config = {
      ...this.#config,
      ...config,
    };
  }

  getConfig() {
    return this.#config;
  }
}
