import { MMKV } from "react-native-mmkv";
import { atom } from "jotai";

import { DeviceData } from "../types/types";

import { DefaultSettings } from "./default-state";
import { GeneralSetting } from "./storage-keys";

const storage = new MMKV();

function getItem(key: string): string | null {
  const value = storage.getString(key);
  return value ? value : null;
}

function setItem(key: string, value: string): void {
  storage.set(key, value);
}

function removeItem(key: string): void {
  storage.delete(key);
}

function clearAll(): void {
  storage.clearAll();
}

const atomWithLocalStorage = <Value>(key: string, initialValue: Value) => {
  console.log(initialValue);

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
  { lastServerConnectionConfigId: null, serverConnectionConfigs: [] }
);

export const appThemeAtom = atomWithLocalStorage(
  GeneralSetting.AppTheme,
  DefaultSettings.theme
);
