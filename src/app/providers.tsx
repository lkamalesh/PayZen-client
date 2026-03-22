import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { queryClient } from '@/api/queryClient';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import { appTheme } from '@/app/theme';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
