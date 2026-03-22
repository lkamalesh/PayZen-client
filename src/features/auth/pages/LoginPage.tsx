import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { toHttpError } from '@/api/httpError';
import { useAuth } from '@/features/auth/context/AuthContext';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/authSchemas';
import { useToast } from '@/hooks/useToast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { setToken, hydrateMerchantSession } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (token, variables) => {
      setToken(token, variables.email);
      await hydrateMerchantSession(variables.email);
      showToast('Login successful', 'success');
      const nextPath = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(nextPath, { replace: true });
    },
    onError: (error) => {
      showToast(toHttpError(error).message, 'error');
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" p={2}>
      <Card sx={{ maxWidth: 460, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Sign in to PayZen
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Use your merchant credentials to access payment operations.
          </Typography>
          <Stack component="form" onSubmit={onSubmit} spacing={2} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...form.register('email')}
              error={Boolean(form.formState.errors.email)}
              helperText={form.formState.errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...form.register('password')}
              error={Boolean(form.formState.errors.password)}
              helperText={form.formState.errors.password?.message}
            />
            <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            <Typography variant="body2">
              New merchant?{' '}
              <Link component={RouterLink} to="/auth/register">
                Register here
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
