import { ServerConfig } from "../components/login/login-form";

export enum GeneralSetting {
  CurrentUser = "CurrentUser",
  CurrentServerConfig = "CurrentServerConfig",
  CurrentLibraryId = "CurrentLibraryId",
  DeviceData = "DeviceData",
  ServerSettings = "ServerSettings",
  TempBookFiles = "TempBookFiles",
}

export type DeviceData = {
  serverConnectionConfigs: ServerConfig[];
  lastServerConnectionConfigId: string | undefined | null;
};
