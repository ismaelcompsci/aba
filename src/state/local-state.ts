import { MMKV } from "react-native-mmkv";
import { atom } from "jotai";

import { ServerSettings } from "../types/aba";
import { DeviceData, ServerConfig } from "../types/types";

import { DefaultSettings } from "./default-state";
import { GeneralSetting } from "./storage-keys";

const storage = new MMKV();

function getItem(key: string): string | null {
  const value = storage.getString(key);
  return value ? value : null;
}

function setItem(key: string, value: string): void {
  if (typeof value === "string") {
    storage.set(key, value);
  } else {
    storage.set(key, JSON.stringify(value));
  }
}

function removeItem(key: string): void {
  storage.delete(key);
}

function clearAll(): void {
  storage.clearAll();
}

const atomWithLocalStorage = <Value>(key: string, initialValue: Value) => {
  const getInitialValue = () => {
    const item = getItem(key);
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

export const deviceDataAtom = atomWithLocalStorage<DeviceData>(
  GeneralSetting.DeviceData,
  DefaultSettings.deviceData
);

export const appThemeAtom = atomWithLocalStorage(
  GeneralSetting.AppTheme,
  DefaultSettings.theme
);

export const serverSettingsAtom = atomWithLocalStorage<ServerSettings>(
  GeneralSetting.ServerSettings,
  {} as ServerSettings
);

export const currentServerConfigAtom = atomWithLocalStorage<ServerConfig>(
  GeneralSetting.CurrentServerConfig,
  {} as ServerConfig
);
