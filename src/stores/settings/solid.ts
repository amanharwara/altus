import { createStore, unwrap } from "solid-js/store";
import {
  SettingKey,
  SettingValue,
  SettingsStore,
  SettingsStoreDefaults,
} from "./common";

const [settingsStore, updateSettingsStore] = createStore<SettingsStore>(
  SettingsStoreDefaults()
);

window.electronSettingsStore.getStore().then((store) => {
  updateSettingsStore(store);
});

export function getSettingValue<Key extends SettingKey>(
  key: Key
): SettingValue[Key] {
  const settings = settingsStore.settings;
  const value = settings[key].value;
  return value as SettingValue[Key];
}

export function setSettingValue<Key extends SettingKey>(
  key: Key,
  value: SettingValue[Key]
) {
  updateSettingsStore("settings", (settings) => ({
    ...settings,
    [key]: { value },
  }));
  window.electronSettingsStore.setSettings(unwrap(settingsStore.settings));
}

export { settingsStore };
