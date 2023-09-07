import { ServerConfig } from "../app";

export enum GeneralSetting {
  ServerConfig = "ServerConfig",
  CurrentLibrary = "CurrentLibrary",
  DeviceData = "DeviceData",
  ServerSettings = "ServerSettings",
}

export type DeviceData = {
  serverConnectionConfigs: ServerConfig[];
  lastServerConnectionConfigId: string | undefined | null;
};
