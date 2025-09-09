import { join } from "path";
import * as fs0 from "fs";

//#region src/file-system.d.ts
declare class FileSystem {
  readFile(path: string): string;
  isExists(path: string): boolean;
  readDir(path: string): fs0.Dirent<string>[];
  getProjectBaseRoot(): string;
  writeFile(path: string, content: string): void;
  join(...args: Parameters<typeof join>): string;
}
//#endregion
//#region src/config-reader.d.ts
type FileExtension = string;
type FileNameTransform = "RemoveExtension"[];
type ExportType = "all" | "default";
type ExportTypeTransform = "KebabCaseToCamelCase"[];
type BarrelConfigExports = {
  ext: string;
  fileNameTransform?: FileNameTransform;
  exportType: ExportType;
  exportTypeTransform?: ExportTypeTransform;
};
type BarrelConfig = {
  rootFolders: string[];
  exports: BarrelConfigExports[];
};
declare class ConfigReader {
  #private;
  constructor(fileSystem: FileSystem);
  getConfig(): BarrelConfig;
}
//#endregion
//#region src/barrel-builder.d.ts
declare class BarrelBuilder {
  #private;
  constructor(fileSystem: FileSystem, configReader: ConfigReader);
  run(): Promise<void>;
}
//#endregion
export { BarrelBuilder, BarrelConfig, BarrelConfigExports, ConfigReader, ExportType, ExportTypeTransform, FileExtension, FileNameTransform, FileSystem };