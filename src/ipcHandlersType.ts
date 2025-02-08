export type ElectronIPCHandlers = {
  onOpenSettings: (callback: () => void) => () => void;
  onEditActiveTab: (callback: () => void) => () => void;
  onCloseActiveTab: (callback: () => void) => () => void;
  onOpenTabDevTools: (callback: () => void) => () => void;
  onAddNewTab: (callback: () => void) => () => void;
  onRestoreTab: (callback: () => void) => () => void;
  onNextTab: (callback: () => void) => () => void;
  onPreviousTab: (callback: () => void) => () => void;
  onFirstTab: (callback: () => void) => () => void;
  onLastTab: (callback: () => void) => () => void;
  onOpenWhatsappLink: (callback: (url: string) => void) => () => void;
  onReloadCustomTitleBar: (callback: () => void) => () => void;
  onReloadTranslations: (callback: () => void) => () => void;
  onNewChat: (callback: () => void) => () => void;
  onOpenThemeManager: (callback: () => void) => () => void;
  onMessageCount: (
    callback: (detail: { messageCount: number; tabId: string }) => void
  ) => () => void;
};
