import { DeviceData, GeneralSetting } from "../types/types";
import { storage } from "../utils/use-storage";
import keys from "../constants/keys.json";
import { ServerConfig } from "../app";

const saveServerSetting = (key: GeneralSetting, value: any) => {
  storage.set(`${keys.SERVER.SETTINGS_PREFIX}${key}`, JSON.stringify(value));
  console.info(`Set GeneralSetting ${key} to ${JSON.stringify(value)}`);
};

const getServerSetting = (key: GeneralSetting): any | undefined => {
  const setting = storage.getString(`${keys.SERVER.SETTINGS_PREFIX}${key}`);
  if (setting) {
    return JSON.parse(setting);
  }
  return null;
};

const getDeviceData = (): DeviceData => {
  const deviceData = getServerSetting(GeneralSetting.DeviceData);
  if (!deviceData) {
    return {
      serverConnectionConfigs: [],
      lastServerConnectionConfigId: null,
    };
  }

  return deviceData;
};

const setCurrentServerConfig = (serverConfig: ServerConfig) => {
  const deviceData = getDeviceData();

  const sc = deviceData.serverConnectionConfigs.find(
    (sc) => sc.userId == serverConfig.userId
  );
  if (sc) {
    deviceData.lastServerConnectionConfigId = sc.userId;
    sc.password = serverConfig.password;
    sc.token = serverConfig.token;
    sc.serverAddress = serverConfig.serverAddress;
    sc.username = serverConfig.username;
    saveServerSetting(GeneralSetting.DeviceData, deviceData);
  } else {
    deviceData.serverConnectionConfigs.push(serverConfig);
    deviceData.lastServerConnectionConfigId = serverConfig.userId;

    saveServerSetting(GeneralSetting.DeviceData, deviceData);
  }

  return sc;
};

export default {
  setCurrentServerConfig,
  getDeviceData,
  getServerSetting,
  saveServerSetting,
};
