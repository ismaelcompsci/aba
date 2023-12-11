import { MMKV } from "react-native-mmkv";
import { atom } from "jotai";

export const storage = new MMKV();

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

export const atomWithLocalStorage = <Value>(
  key: string,
  initialValue: Value
) => {
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
    (get, set, update: Value | ((prevValue: Value) => Value)) => {
      const nextValue: Value =
        typeof update === "function"
          ? (update as (prevValue: Value) => Value)(get(baseAtom) as Value)
          : (update as Value);
      set(baseAtom, nextValue);
      setItem(key, JSON.stringify(nextValue));
    }
  );
  return derivedAtom;
};
