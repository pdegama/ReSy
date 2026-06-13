import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

type AppState = {
  sidebarOpen: boolean;
  themeMode: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        themeMode: 'system',
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setThemeMode: (mode) => set({ themeMode: mode }),
      }),
      {
        name: 'resy-app-store',
        partialize: (state) => ({ themeMode: state.themeMode }),
      },
    ),
  ),
);

