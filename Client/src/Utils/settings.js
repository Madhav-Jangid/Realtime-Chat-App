export const SETTINGS_KEY = 'chat_app_settings';

export const defaultSettings = {
  darkMode: false,
  desktopNotifications: true,
  soundAlerts: true,
  enterToSend: true,
  readReceipts: true,
  typingIndicators: true,
  compactMode: false,
  autoDownloadMedia: true
};

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...defaultSettings, ...parsed };
  } catch (_error) {
    return { ...defaultSettings };
  }
}

export function saveSettings(next) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function applyThemeFromSettings(settings) {
  if (settings.darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}
