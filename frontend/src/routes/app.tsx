import { useEffect } from 'react';
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  Inbox,
  Moon,
  PanelLeft,
  RefreshCcw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sun,
  TerminalSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Route, Routes } from 'react-router-dom';
import { useHealthQuery } from '../features/health/use-health-query';
import { useAppStore } from '../store/app-store';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

const navItems = [
  { label: 'Inbox', icon: Inbox },
  { label: 'Overview', icon: Activity, active: true },
  { label: 'Services', icon: Server },
  { label: 'Database', icon: Database },
  { label: 'Deployments', icon: Cloud },
  { label: 'Settings', icon: Settings },
];

const themeOptions = [
  { mode: 'system' as const, label: 'System', icon: PanelLeft },
  { mode: 'light' as const, label: 'Light', icon: Sun },
  { mode: 'dark' as const, label: 'Dark', icon: Moon },
];

const foundations = [
  'Go Fiber API',
  'React + Vite',
  'TanStack Query',
  'Zustand store',
  'Docker Compose',
  'Postgres ready',
];

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

function Dashboard() {
  const healthQuery = useHealthQuery();
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const apiStatus = healthQuery.isLoading
    ? 'Checking'
    : healthQuery.isError
      ? 'Offline'
      : healthQuery.data?.status.toUpperCase();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const useDarkTheme = themeMode === 'dark' || (themeMode === 'system' && mediaQuery.matches);

      document.documentElement.classList.toggle('dark', useDarkTheme);
      document.documentElement.dataset.theme = themeMode;
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#37352f] transition-colors dark:bg-[#11100e] dark:text-[#f4f1ea]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[252px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#ebe5dc] bg-[#f7f4ef] px-3 py-4 dark:border-[#2a261f] dark:bg-[#161410] lg:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2f6f68] text-sm font-semibold text-white">
                R
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">ReSy</p>
                <p className="mt-1 text-xs text-[#8c8378] dark:text-[#a59b8f]">Production workspace</p>
              </div>
            </div>

            <nav className="mt-7 space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    'flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-2.5 text-left text-sm transition duration-150 ease-out active:scale-[0.99]',
                    item.active
                      ? 'border-[#d6e7e3] bg-[#e8f2ef] text-[#2f6f68] dark:border-[#294943] dark:bg-[#172724] dark:text-[#9ed7cf]'
                      : 'text-[#6b645c] hover:border-[#e9e0d6] hover:bg-[#f0ebe3] hover:text-[#37352f] dark:text-[#b7afa4] dark:hover:border-[#312c25] dark:hover:bg-[#23201b] dark:hover:text-[#f4f1ea]',
                  )}
                  type="button"
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-lg border border-[#ebe5dc] bg-[#fbfaf8] p-3 dark:border-[#2a261f] dark:bg-[#191815]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2f6f68] dark:text-[#9ed7cf]" />
                <p className="text-sm font-medium">Local stack</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8c8378] dark:text-[#a59b8f]">
                Frontend, API, and Postgres are ready to run from one production compose file.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-[#ebe5dc] bg-[#fbfaf8]/95 px-4 py-3 dark:border-[#2a261f] dark:bg-[#11100e]/95 sm:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-transparent bg-[#f4f0e9] text-[#6b645c] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.035)] transition active:scale-[0.98] dark:bg-[#211e19] dark:text-[#b7afa4] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.045)] lg:hidden"
                  type="button"
                  aria-label="Open navigation"
                >
                  <PanelLeft size={17} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#8c8378] dark:text-[#a59b8f]">
                    <span>Workspace</span>
                    <ChevronRight size={13} />
                    <span>Overview</span>
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#37352f] dark:text-[#f4f1ea] sm:text-3xl">
                    System dashboard
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex h-9 min-w-0 items-center gap-2 rounded-md border border-transparent bg-[#f4f0e9] px-3 text-sm text-[#8c8378] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.03)] transition duration-150 ease-out hover:bg-[#f0ebe3] dark:bg-[#211e19] dark:text-[#a59b8f] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.035)] dark:hover:bg-[#26221d] sm:w-72">
                  <Search size={16} />
                  <span className="truncate">Search services, logs, settings</span>
                </div>
                <div className="flex items-center rounded-md border border-transparent bg-[#f4f0e9] p-0.5 shadow-[inset_0_0_0_1px_rgba(55,53,47,0.03)] dark:bg-[#211e19] dark:shadow-[inset_0_0_0_1px_rgba(244,241,234,0.035)]">
                  {themeOptions.map((option) => (
                    <button
                      key={option.mode}
                      className={cn(
                        'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[5px] border border-transparent px-2.5 text-xs font-medium transition duration-150 ease-out active:scale-[0.98]',
                        themeMode === option.mode
                          ? 'bg-[#fffefd] text-[#2f6f68] shadow-[0_1px_2px_rgba(55,53,47,0.05)] dark:bg-[#20312d] dark:text-[#9ed7cf] dark:shadow-[0_1px_2px_rgba(0,0,0,0.16)]'
                          : 'text-[#8c8378] hover:bg-[#eee8df] hover:text-[#37352f] dark:text-[#a59b8f] dark:hover:bg-[#2a261f] dark:hover:text-[#f4f1ea]',
                      )}
                      type="button"
                      onClick={() => setThemeMode(option.mode)}
                      aria-pressed={themeMode === option.mode}
                    >
                      <option.icon size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>
                <Button size="icon" variant="secondary" aria-label="Notifications">
                  <Bell size={16} />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-5 sm:px-6 xl:px-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-[#ebe5dc] bg-white px-5 py-4 dark:border-[#2a261f] dark:bg-[#191815]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Runtime health</CardTitle>
                        <CardDescription>Live response from the Go Fiber API.</CardDescription>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => void healthQuery.refetch()}
                        disabled={healthQuery.isFetching}
                      >
                        <RefreshCcw size={16} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid divide-y divide-[#ebe5dc] dark:divide-[#2a261f] md:grid-cols-3 md:divide-x md:divide-y-0">
                      <Metric
                        icon={Activity}
                        label="API status"
                        value={apiStatus ?? 'Unknown'}
                        tone={healthQuery.isError ? 'red' : 'emerald'}
                      />
                      <Metric
                        icon={TerminalSquare}
                        label="Environment"
                        value={healthQuery.data?.environment ?? 'production'}
                        tone="sky"
                      />
                      <Metric icon={Database} label="Database" value="Docker Postgres" tone="amber" />
                    </div>
                    <div className="border-t border-[#ebe5dc] p-5 dark:border-[#2a261f]">
                      <div className="flex items-start gap-3 rounded-lg bg-[#f7f4ef] p-4 dark:bg-[#211e19]">
                        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#6b645c] ring-1 ring-[#ebe5dc] dark:bg-[#191815] dark:text-[#b7afa4] dark:ring-[#2a261f]">
                          <Server size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {healthQuery.isError
                              ? 'Backend unavailable'
                              : healthQuery.data?.service ?? 'ReSy API service'}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#8c8378] dark:text-[#a59b8f]">
                            {healthQuery.isError
                              ? healthQuery.error.message
                              : 'The app shell is wired for local development and production Docker deployment.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <Card>
                <CardHeader className="px-5 py-4">
                  <CardTitle>Release posture</CardTitle>
                  <CardDescription>Production basics in place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pb-5">
                  {foundations.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 size={16} className="text-[#2f6f68] dark:text-[#9ed7cf]" />
                      <span className="text-[#5f5a52] dark:text-[#d8d0c6]">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <InfoPanel
                icon={Cloud}
                title="Frontend gateway"
                eyebrow="Nginx"
                body="Static React assets are served by Nginx, with `/api` proxied internally to the backend service."
              />
              <InfoPanel
                icon={Server}
                title="Backend service"
                eyebrow="Go Fiber"
                body="The API runs as a compiled Linux binary and receives production env through Docker Compose."
              />
              <InfoPanel
                icon={Database}
                title="Postgres storage"
                eyebrow="Docker volume"
                body="Postgres 16 uses a named volume, so container restarts do not wipe application data."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type MetricProps = {
  icon: typeof Activity;
  label: string;
  value: string;
  tone: 'emerald' | 'sky' | 'amber' | 'red';
};

function Metric({ icon: Icon, label, value, tone }: MetricProps) {
  const toneClass = {
    emerald: 'bg-[#edf7ed] text-[#2f7d32] ring-[#d6ead6] dark:bg-[#17301b] dark:text-[#8fd694] dark:ring-[#254b2a]',
    sky: 'bg-[#eef4f8] text-[#34708d] ring-[#d8e8f0] dark:bg-[#142933] dark:text-[#8fc8df] dark:ring-[#254453]',
    amber: 'bg-[#faf1df] text-[#9a6500] ring-[#efdcb6] dark:bg-[#332514] dark:text-[#e0b15a] dark:ring-[#57401f]',
    red: 'bg-[#f3e9e4] text-[#9a483a] ring-[#ead7cf] dark:bg-[#321f1a] dark:text-[#e0a396] dark:ring-[#55342c]',
  }[tone];

  return (
    <div className="p-5">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-md ring-1', toneClass)}>
        <Icon size={17} />
      </div>
      <p className="mt-4 text-xs font-medium uppercase text-[#8c8378] dark:text-[#a59b8f]">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-normal">{value}</p>
    </div>
  );
}

type InfoPanelProps = {
  icon: typeof Cloud;
  eyebrow: string;
  title: string;
  body: string;
};

function InfoPanel({ icon: Icon, eyebrow, title, body }: InfoPanelProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-[#8c8378] dark:text-[#a59b8f]">{eyebrow}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f0ece5] text-[#6b645c] dark:bg-[#23201b] dark:text-[#b7afa4]">
            <Icon size={16} />
          </span>
        </div>
        <h2 className="mt-5 text-base font-semibold tracking-normal">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#8c8378] dark:text-[#a59b8f]">{body}</p>
      </CardContent>
    </Card>
  );
}
