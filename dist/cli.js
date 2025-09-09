import { BarrelBuilder, ConfigReader, FileSystem } from "./src-UbM7ne1u.js";

//#region src/cli.ts
(async () => {
	const fileSystem = new FileSystem();
	const configReader = new ConfigReader(fileSystem);
	await new BarrelBuilder(fileSystem, configReader).run();
})();

//#endregion
export {  };