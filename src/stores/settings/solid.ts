import { createStore } from "solid-js/store";
import {
  SettingKey,
  SettingValue,
  Settings,
  getDefaultSettings,
} from "./common";

const [settingsStore, updateSettingsStore] = createStore<Settings>(
  getDefaultSettings()
);

window.electronSettingsStore.getStore().then((store) => {
  updateSettingsStore(store);
});

export function getSettingValue<Key extends SettingKey>(
  key: Key
): SettingValue[Key] {
  const value = settingsStore[key].value;
  return value as SettingValue[Key];
}

export function setSettingValue<Key extends SettingKey>(
  key: Key,
  value: SettingValue[Key]
) {
  updateSettingsStore((prev) => ({ ...prev, [key]: { value } }));
  // The main process enforces settings dependencies and returns the stored
  // settings, which may differ from the optimistic update above.
  window.electronSettingsStore.setSetting(key, value).then(updateSettingsStore);
}

export { settingsStore };
