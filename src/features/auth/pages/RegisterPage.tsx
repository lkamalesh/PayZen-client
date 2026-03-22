import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { toHttpError } from '@/api/httpError';
import { useAuth } from '@/features/auth/context/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/authSchemas';
import { useToast } from '@/hooks/useToast';

const extractErrorDescription = (details: unknown): string | null => {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const payload = details as {
    description?: unknown;
    Description?: unknown;
    detail?: unknown;
    Detail?: unknown;
    errorDescription?: unknown;
    error_description?: unknown;
  };

  const candidate =
    payload.description ??
    payload.Description ??
    payload.detail ??
    payload.Detail ??
    payload.errorDescription ??
    payload.error_description;

  if (typeof candidate !== 'string') {
    return null;
  }

  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setMerchant } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: '',
      country: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (merchant, variables) => {
      setMerchant({ ...merchant, email: merchant.email ?? variables.email });
      showToast(`Registration complete. Merchant ${merchant.merchantId} created.`, 'success');
      navigate('/auth/login', { replace: true });
    },
    onError: (error) => {
      showToast(toHttpError(error).message, 'error');
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  const registerError = registerMutation.isError ? toHttpError(registerMutation.error) : null;
  const errorDescription = extractErrorDescription(registerError?.details);

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" p={2}>
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Register Merchant
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your merchant account and store Merchant ID and API key securely.
          </Typography>
          <Stack component="form" onSubmit={onSubmit} spacing={2} noValidate>
            {registerError ? (
              <Alert severity="error">
                {registerError.message}
                {errorDescription && errorDescription !== registerError.message ? ` ${errorDescription}` : ''}
              </Alert>
            ) : null}
            <TextField
              label="Business Name"
              fullWidth
              {...form.register('userName')}
              error={Boolean(form.formState.errors.userName)}
              helperText={form.formState.errors.userName?.message}
            />
            <TextField
              label="Country"
              fullWidth
              {...form.register('country')}
              error={Boolean(form.formState.errors.country)}
              helperText={form.formState.errors.country?.message}
            />
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
            <Button type="submit" variant="contained" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/auth/login">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
