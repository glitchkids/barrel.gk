import { BarrelBuilder, ConfigReader, FileSystem } from "@";
(async () => {
  const fileSystem = new FileSystem();
  const configReader = new ConfigReader(fileSystem);
  const builder = new BarrelBuilder(fileSystem, configReader);

  await builder.run();
})();
