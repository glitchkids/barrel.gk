import { BarrelBuilder, ConfigReader, FileSystem } from "@";

const fileSystem = new FileSystem();
const configReader = new ConfigReader(fileSystem);

const barrelBuilder = new BarrelBuilder(fileSystem, configReader);


(async () => await barrelBuilder.run())();
