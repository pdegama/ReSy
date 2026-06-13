import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  LogIn,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { checkAvailability, getCurrentUser, login, register, type AuthUser } from '../api/auth';
import { useHealthQuery } from '../features/health/use-health-query';
import { useAppStore } from '../store/app-store';
import { useAuthStore } from '../store/auth-store';
import { Button } from '../components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const totalRegisterSteps = 5;

export function App() {
  const themeMode = useAppStore((state) => state.themeMode);
  const clearExpiredSession = useAuthStore((state) => state.clearExpiredSession);

  useEffect(() => {
    clearExpiredSession();
  }, [clearExpiredSession]);

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
    <Routes>
      <Route path="/" element={<ProtectedDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedDashboard() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getCurrentUser(token ?? ''),
    enabled: Boolean(token) && Boolean(expiresAt && expiresAt > Date.now()),
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.isError || (expiresAt && expiresAt <= Date.now())) {
      logout();
    }
  }, [expiresAt, logout, meQuery.isError]);

  if (!token || !expiresAt || expiresAt <= Date.now()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Dashboard currentUser={meQuery.data ?? user} onLogout={logout} />;
}

type DashboardProps = {
  currentUser: AuthUser | null;
  onLogout: () => void;
};

function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () =>
      login({
        email: email.trim().toLowerCase(),
        password,
      }),
    onSuccess: (session) => {
      setSession(session.token, session.user);
    },
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf8] px-4 text-[#37352f] dark:bg-[#11100e] dark:text-[#f4f1ea]">
      <section className="w-full max-w-[340px]">
        <LogoMark className="mx-auto mb-5" />
        <h1 className="mb-7 text-center text-2xl font-semibold tracking-normal">ReSy</h1>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loginMutation.isPending}
              required
            />
          </Field>

          <Field label="Password" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={8}
              disabled={loginMutation.isPending}
              required
            />
          </Field>

          {loginMutation.isError && <AuthError message={loginMutation.error.message} />}

          <Button className="mt-1 w-full" type="submit" disabled={loginMutation.isPending}>
            <LogIn size={16} />
            {loginMutation.isPending ? 'Wait' : 'Login'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[#8c8378] dark:text-[#a59b8f]">
          New here?{' '}
          <Link className="font-medium text-[#2f6f68] hover:text-[#285f59] dark:text-[#9ed7cf]" to="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}

function RegisterPage() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const debouncedEmail = useDebouncedValue(normalizedEmail, 450);
  const debouncedUsername = useDebouncedValue(normalizedUsername, 450);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isDebouncedEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);
  const usernameFromEmail = normalizedEmail.split('@')[0]?.replace(/[^a-z0-9._-]/g, '') ?? '';
  const isEmailSettling = normalizedEmail !== debouncedEmail;
  const isUsernameSettling = normalizedUsername !== debouncedUsername;

  const emailAvailabilityQuery = useQuery({
    queryKey: ['auth', 'availability', 'email', debouncedEmail],
    queryFn: () => checkAvailability({ email: debouncedEmail }),
    enabled: step === 1 && isDebouncedEmailValid,
    retry: false,
  });

  const usernameAvailabilityQuery = useQuery({
    queryKey: ['auth', 'availability', 'username', debouncedUsername],
    queryFn: () => checkAvailability({ username: debouncedUsername }),
    enabled: step === 2 && debouncedUsername !== '',
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      }),
    onSuccess: (session) => {
      setSession(session.token, session.user);
    },
  });

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value.toLowerCase());

    const nextEmail = value.trim().toLowerCase();
    const nextEmailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);
    const nextUsername = nextEmail.split('@')[0]?.replace(/[^a-z0-9._-]/g, '') ?? '';

    if (nextEmailIsValid && nextUsername !== '' && !usernameEdited) {
      setUsername(nextUsername);
    }
  }, [usernameEdited]);

  const steps = useMemo(
    () => [
      {
        title: 'Name',
        label: 'Your name',
        value: name,
        setValue: setName,
        inputType: 'text',
        autoComplete: 'name',
        isValid: name.trim() !== '',
      },
      {
        title: 'Email',
        label: 'Email',
        value: email,
        setValue: handleEmailChange,
        inputType: 'email',
        autoComplete: 'email',
        isValid:
          isEmailValid &&
          !isEmailSettling &&
          emailAvailabilityQuery.data?.emailAvailable === true,
        helper:
          email.trim() === ''
            ? undefined
            : !isEmailValid
              ? 'Enter a valid email.'
              : isEmailSettling || emailAvailabilityQuery.isFetching
                ? 'Checking email...'
                : emailAvailabilityQuery.data?.emailAvailable === false
                  ? 'Email already exists.'
                  : emailAvailabilityQuery.data?.emailAvailable === true
                    ? 'Email available.'
                    : undefined,
        helperTone:
          emailAvailabilityQuery.data?.emailAvailable === false || (email.trim() !== '' && !isEmailValid)
            ? 'error'
            : 'success',
      },
      {
        title: 'Username',
        label: 'Username',
        value: username,
        setValue: (value: string) => {
          setUsernameEdited(true);
          setUsername(value.toLowerCase().replace(/\s+/g, ''));
        },
        inputType: 'text',
        autoComplete: 'username',
        isValid:
          normalizedUsername !== '' &&
          !isUsernameSettling &&
          usernameAvailabilityQuery.data?.usernameAvailable === true,
        helper:
          normalizedUsername === ''
            ? usernameFromEmail
              ? `Suggestion: ${usernameFromEmail}`
              : undefined
            : isUsernameSettling || usernameAvailabilityQuery.isFetching
              ? 'Checking username...'
              : usernameAvailabilityQuery.data?.usernameAvailable === false
                ? 'Username taken.'
                : usernameAvailabilityQuery.data?.usernameAvailable === true
                  ? 'Username available.'
                  : undefined,
        helperTone: usernameAvailabilityQuery.data?.usernameAvailable === false ? 'error' : 'success',
      },
      {
        title: 'Password',
        label: 'Password',
        value: password,
        setValue: setPassword,
        inputType: 'password',
        autoComplete: 'new-password',
        isValid: password.length >= 8,
        helper: password !== '' && password.length < 8 ? 'Use at least 8 characters.' : undefined,
        helperTone: 'error',
      },
    ],
    [
      email,
      emailAvailabilityQuery.data?.emailAvailable,
      emailAvailabilityQuery.isFetching,
      isEmailSettling,
      isEmailValid,
      isUsernameSettling,
      name,
      normalizedUsername,
      password,
      username,
      usernameAvailabilityQuery.data?.usernameAvailable,
      usernameAvailabilityQuery.isFetching,
      usernameFromEmail,
      handleEmailChange,
    ],
  );

  if (token) {
    return <Navigate to="/" replace />;
  }

  const isReviewStep = step === steps.length;
  const currentStep = steps[step];
  const canContinue = isReviewStep || currentStep.isValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isReviewStep) {
      setStep((current) => current + 1);
      registerMutation.reset();
      return;
    }

    registerMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-4 py-5 text-[#37352f] dark:bg-[#11100e] dark:text-[#f4f1ea] sm:px-6">
      <header className="flex items-center justify-between">
        <Link className="flex items-center gap-2.5" to="/login">
          <LogoMark />
          <span className="text-sm font-semibold">ReSy</span>
        </Link>
        <Link className="text-sm font-medium text-[#2f6f68] dark:text-[#9ed7cf]" to="/login">
          Login
        </Link>
      </header>

      <section className="grid min-h-[calc(100vh-76px)] items-center py-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
        <form className="w-full max-w-[390px] lg:ml-[8vw]" onSubmit={handleSubmit}>
          {!isReviewStep ? (
            <>
              <p className="text-sm font-medium text-[#8c8378] dark:text-[#a59b8f]">
                Step {step + 1} of {totalRegisterSteps}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal">{currentStep.title}</h1>
              <div className="mt-7 space-y-3">
                <Field label={currentStep.label} htmlFor={`register-${currentStep.title.toLowerCase()}`}>
                  <Input
                    id={`register-${currentStep.title.toLowerCase()}`}
                    type={currentStep.inputType}
                    value={currentStep.value}
                    onChange={(event) => currentStep.setValue(event.target.value)}
                    autoComplete={currentStep.autoComplete}
                    minLength={currentStep.inputType === 'password' ? 8 : undefined}
                    disabled={registerMutation.isPending}
                    autoFocus
                    required
                  />
                </Field>
                {'helper' in currentStep && currentStep.helper ? (
                  <p
                    className={cn(
                      'text-sm',
                      currentStep.helperTone === 'error'
                        ? 'text-[#b84a3c]'
                        : 'text-[#2f6f68] dark:text-[#9ed7cf]',
                    )}
                  >
                    {currentStep.helper}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[#8c8378] dark:text-[#a59b8f]">
                Step {totalRegisterSteps} of {totalRegisterSteps}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal">Review</h1>
              <div className="mt-7 divide-y divide-[#ebe5dc] rounded-md border border-[#ebe5dc] bg-white dark:divide-[#2a261f] dark:border-[#2a261f] dark:bg-[#191815]">
                <ReviewRow label="Name" value={name.trim()} />
                <ReviewRow label="Username" value={username.trim()} />
                <ReviewRow label="Email" value={email.trim().toLowerCase()} />
              </div>
            </>
          )}

          {registerMutation.isError && (
            <div className="mt-4">
              <AuthError message={registerMutation.error.message} />
            </div>
          )}

          <div className="mt-7 flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0 || registerMutation.isPending}
              onClick={() => {
                setStep((current) => Math.max(0, current - 1));
                registerMutation.reset();
              }}
            >
              Back
            </Button>
            <Button type="submit" disabled={!canContinue || registerMutation.isPending}>
              {registerMutation.isPending ? 'Creating' : isReviewStep ? 'Create account' : 'Next'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const healthQuery = useHealthQuery();
  const [commandOpen, setCommandOpen] = useState(false);
  const displayName = currentUser?.name || currentUser?.username || currentUser?.email || 'User';
  const apiStatus = healthQuery.isLoading
    ? 'Checking'
    : healthQuery.isError
      ? 'Offline'
      : (healthQuery.data?.status.toUpperCase() ?? 'Online');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#37352f] dark:bg-[#11100e] dark:text-[#f4f1ea]">
      <header className="grid h-16 grid-cols-[1fr_minmax(180px,520px)_1fr] items-center gap-3 border-b border-[#ebe5dc] px-4 dark:border-[#2a261f] sm:px-6">
        <div className="justify-self-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 items-center gap-2 rounded-md bg-[#f4f0e9] px-2.5 text-sm text-[#5f5a52] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.03)] transition hover:bg-[#f0ebe3] dark:bg-[#211e19] dark:text-[#d8d0c6] dark:hover:bg-[#26221d]"
                type="button"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2f6f68] text-xs font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} className="hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
              {currentUser?.email ? (
                <DropdownMenuLabel className="truncate pt-0 text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </DropdownMenuLabel>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings size={16} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          className="flex h-9 min-w-0 items-center gap-2 rounded-md bg-[#f4f0e9] px-3 text-left text-sm text-[#8c8378] shadow-[inset_0_0_0_1px_rgba(55,53,47,0.03)] transition hover:bg-[#f0ebe3] dark:bg-[#211e19] dark:text-[#a59b8f] dark:hover:bg-[#26221d]"
          type="button"
          onClick={() => setCommandOpen(true)}
        >
          <Search size={16} />
          <span className="min-w-0 flex-1 truncate">Search</span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[11px] text-[#8c8378] dark:bg-[#191815] dark:text-[#a59b8f] sm:inline">
            Ctrl K
          </kbd>
        </button>

        <Link className="flex items-center gap-2 justify-self-end" to="/">
          <span className="hidden text-sm font-semibold sm:inline">ReSy</span>
          <LogoMark />
        </Link>
      </header>

      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <SimpleMetric label="API" value={apiStatus} />
          <SimpleMetric label="User" value={displayName} />
          <SimpleMetric label="Session" value="7 days" />
        </div>
      </section>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Search">
        <CommandInput placeholder="Search ReSy..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <User size={16} />
              Profile
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Settings size={16} />
              Settings
            </CommandItem>
            <CommandItem onSelect={onLogout}>
              <LogOut size={16} />
              Logout
              <CommandShortcut>Exit</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </main>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md bg-[#2f6f68] text-sm font-semibold text-white',
        className,
      )}
    >
      R
    </span>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5">
      <p className="text-xs text-[#8c8378] dark:text-[#a59b8f]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#ebe5dc] bg-white px-4 py-3 dark:border-[#2a261f] dark:bg-[#191815]">
      <p className="text-xs text-[#8c8378] dark:text-[#a59b8f]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-[#f3e9e4] px-3 py-2 text-sm text-[#9a483a] ring-1 ring-[#ead7cf] dark:bg-[#321f1a] dark:text-[#e0a396] dark:ring-[#55342c]">
      {message}
    </p>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#5f5a52] dark:text-[#d8d0c6]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
