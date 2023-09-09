import { DeviceData, GeneralSetting } from "../types/types";
import { MMKV } from "react-native-mmkv";
import { atom } from "jotai/vanilla";
import { ServerConfig } from "../components/login/login-form";
import { ServerSettings, User } from "../types/server";

const storage = new MMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}

const atomWithLocalStorage = <Value>(key: string, initialValue: Value) => {
  const getInitialValue = () => {
    const item = getItem(key) as string;
    if (item !== null) {
      return JSON.parse(item);
    }
    return initialValue;
  };
  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom) as Value,
    (get, set, update) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      setItem(key, JSON.stringify(nextValue));
    }
  );
  return derivedAtom;
};

const initDeviceData = {
  serverConnectionConfigs: [],
  lastServerConnectionConfigId: null,
};

export const deviceDataAtom = atomWithLocalStorage<DeviceData>(
  GeneralSetting.DeviceData,
  initDeviceData
);

export const serverSettingsAtom = atomWithLocalStorage<ServerSettings>(
  GeneralSetting.ServerSettings,
  {} as ServerSettings
);

export const currentUserAtom = atomWithLocalStorage<User>(
  GeneralSetting.CurrentUser,
  {} as User
);

export const currentLibraryAtom = atomWithLocalStorage<string>(
  GeneralSetting.CurrentLibrary,
  ""
);

export const currentServerConfigAtom = atomWithLocalStorage<ServerConfig>(
  GeneralSetting.CurrentServerConfig,
  {} as ServerConfig
);
