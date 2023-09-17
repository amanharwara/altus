import { Component, JSX, createContext, createResource } from "solid-js";

type I18NContextType = {
  t: (key: string) => string;
};

export const I18NContext = createContext<I18NContextType>({
  t: (key: string) => key,
});

export const I18NProvider: Component<{
  children: JSX.Element;
}> = (props) => {
  const [translations, { refetch: refetchTranslations }] = createResource(
    window.i18n.getTranslations
  );
  window.electronIPCHandlers.onReloadTranslations(refetchTranslations);

  const t = (key: string) => {
    const value = translations()?.current?.[key];
    if (!value) {
      window.i18n.keyMissing(key);
      return translations()?.fallback?.[key] || key;
    }
    return value;
  };

  const value = {
    t,
  };

  return (
    <I18NContext.Provider value={value}>{props.children}</I18NContext.Provider>
  );
};
