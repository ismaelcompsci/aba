import { ServerConfig } from "../components/login/login-form";

export enum GeneralSetting {
  CurrentUser = "CurrentUser",
  CurrentServerConfig = "CurrentServerConfig",
  CurrentLibrary = "CurrentLibrary",
  DeviceData = "DeviceData",
  ServerSettings = "ServerSettings",
}

export type DeviceData = {
  serverConnectionConfigs: ServerConfig[];
  lastServerConnectionConfigId: string | undefined | null;
};
