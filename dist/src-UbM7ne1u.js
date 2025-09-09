import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "path";

//#region src/config-reader.ts
var ConfigNotFound = class extends Error {
	name = "ConfigNotFound";
	message = "Add barrel.gk config in your package.json";
};
var ConfigReader = class {
	#fileSystem;
	#config = {
		rootFolders: [],
		exports: []
	};
	constructor(fileSystem) {
		this.#fileSystem = fileSystem;
		const path = this.#fileSystem.join(this.#fileSystem.getProjectBaseRoot(), "package.json");
		const packageJSON = this.#fileSystem.readFile(path);
		const config = JSON.parse(packageJSON)["barrel.gk"];
		if (!config) throw new ConfigNotFound();
		this.#config = {
			...this.#config,
			...config
		};
	}
	getConfig() {
		return this.#config;
	}
};

//#endregion
//#region src/file-system.ts
var FileSystem = class {
	readFile(path) {
		return readFileSync(path, { encoding: "utf-8" });
	}
	isExists(path) {
		return existsSync(path);
	}
	readDir(path) {
		return readdirSync(path, { withFileTypes: true });
	}
	getProjectBaseRoot() {
		return process.cwd();
	}
	writeFile(path, content) {
		return writeFileSync(path, content, { encoding: "utf-8" });
	}
	join(...args) {
		return join(...args);
	}
};

//#endregion
//#region src/barrel-builder.ts
var ExportTypeNotFound = class extends Error {
	name = "ExportTypeNotFound";
	message = "Check your package.json config";
};
var BarrelBuilder = class {
	#fileSystem;
	#configReader;
	constructor(fileSystem, configReader) {
		this.#fileSystem = fileSystem;
		this.#configReader = configReader;
	}
	async run() {
		const config = this.#configReader.getConfig();
		if (config.exports.length === 0) return;
		await Promise.all(config.rootFolders.map((path) => this.#processFolder(path))).then(() => console.log("Barrels generated successfully!")).catch((err) => console.error("Error generating barrels:", err));
	}
	#processFolder(path) {
		const indexContent = [];
		const files = this.#fileSystem.readDir(path);
		const ignoreIndexFile = ["index.ts", "index.js"];
		const fileIndex = files.find(({ name }) => ignoreIndexFile.includes(name));
		if (!fileIndex) return false;
		for (const item of files) {
			if (ignoreIndexFile.includes(item.name)) continue;
			if (item.isDirectory()) {
				if (this.#processFolder(this.#fileSystem.join(path, item.name))) indexContent.push(`export * from "./${item.name}";`);
				continue;
			}
			const exportConfig = this.#configReader.getConfig().exports.filter(({ ext }) => item.name.endsWith(ext));
			if (exportConfig.length === 0) continue;
			exportConfig.forEach((config) => {
				const content = BarrelBuilderUtils.createExport(config, item.name);
				indexContent.push(content);
			});
		}
		if (indexContent.length === 0) return false;
		this.#fileSystem.writeFile(this.#fileSystem.join(path, fileIndex.name), indexContent.join("\n"));
		return true;
	}
};
var BarrelBuilderUtils = class {
	static #removeFileExtenstion(str) {
		const arr = str.split(".");
		return arr.slice(0, arr.length - 1).join(".");
	}
	static #transformFileNameTransform(config, fileName) {
		let name = fileName;
		if (!config.fileNameTransform) return name;
		if (config.fileNameTransform.includes("RemoveExtension")) name = this.#removeFileExtenstion(name);
		return name;
	}
	static #transformExportTypeTransform(config, fileName) {
		let name = this.#removeFileExtenstion(fileName);
		if (!config.exportTypeTransform) return name;
		if (config.exportTypeTransform.includes("KebabCaseToCamelCase")) name = this.#toCamelCase(name);
		return name;
	}
	static #toCamelCase(str) {
		return str.split("-").map((w) => w.at(0)?.toUpperCase() + w.slice(1)).join("");
	}
	static createExport(config, fileName) {
		if (!config.exportType) throw new ExportTypeNotFound();
		if (config.exportType === "all") return `export * from "./${this.#transformFileNameTransform(config, fileName)}";`;
		if (config.exportType === "default") return `export { default as ${this.#transformExportTypeTransform(config, fileName)} } from "./${this.#transformFileNameTransform(config, fileName)}";`;
	}
};

//#endregion
export { BarrelBuilder, ConfigReader, FileSystem };