import { ConfigReader, FileSystem } from "@/index.js";

const fileSytem = new FileSystem();
const configReader = new ConfigReader(fileSytem);

console.log(configReader.getConfig());
