import { DeviceData, GeneralSetting } from "../types/types";
import { MMKV } from "react-native-mmkv";
import { atom } from "jotai/vanilla";
import { ServerConfig } from "../components/login/login-form";
import { ServerSettings } from "../types/adbs";

export const storage = new MMKV();

export function getItem<T>(key: string): T | null {
  if (!key) return null;

  const value = storage.getString(key);

  if (!!value) {
    return JSON.parse(value);
  } else {
    return null;
  }
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
      const nextValue: Value =
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

export const currentLibraryIdAtom = atomWithLocalStorage<string>(
  GeneralSetting.CurrentLibraryId,
  ""
);

export const currentServerConfigAtom = atomWithLocalStorage<ServerConfig>(
  GeneralSetting.CurrentServerConfig,
  {} as ServerConfig
);

export const tempBookFilesAtom = atomWithLocalStorage<string[]>(
  GeneralSetting.TempBookFiles,
  []
);
