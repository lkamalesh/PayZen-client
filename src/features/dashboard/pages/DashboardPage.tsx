import {
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { queryKeys } from '@/api/queryKeys';
import { ruleApi } from '@/api/ruleApi';
import { transactionApi } from '@/api/transactionApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingState } from '@/shared/components/states/LoadingState';
import { normalizeStatus } from '@/shared/utils/enum';

const COLORS = ['#0f766e', '#f97316', '#0284c7', '#dc2626'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const DashboardPage = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [showApiKey] = useState(false);
  const isAnalyst = session.role === 'Analyst';
  const isMerchant = session.role === 'Merchant';
  const merchantId = session.merchant?.merchantId;
  const canShowAnalytics = isAnalyst;
  const paymentEndpoint = API_BASE_URL ? `${API_BASE_URL}/api/Payment` : '/api/Payment';
  const displayName =
    session.merchant?.userName ?? session.email?.split('@')[0] ?? 'Merchant User';
  const apiKeyDisplay =
    session.apiKey && !showApiKey ? '•'.repeat(Math.max(14, session.apiKey.length)) : (session.apiKey ?? 'Missing');

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'dashboard-analyst'],
    queryFn: transactionApi.getAll,
    enabled: canShowAnalytics,
  });

  const flaggedQuery = useQuery({
    queryKey: queryKeys.transactions.flagged,
    queryFn: transactionApi.getFlagged,
    enabled: canShowAnalytics,
  });

  const rulesQuery = useQuery({
    queryKey: queryKeys.rules,
    queryFn: ruleApi.getRules,
    enabled: canShowAnalytics,
  });

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    (transactionsQuery.data ?? []).forEach((tx) => {
      const key = normalizeStatus(tx.status);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  }, [transactionsQuery.data]);

  const riskData = useMemo(() => {
    const transactions = transactionsQuery.data ?? [];
    return [
      {
        name: 'Low (<40)',
        value: transactions.filter((item) => item.riskScore < 40).length,
      },
      {
        name: 'Medium (40-70)',
        value: transactions.filter((item) => item.riskScore >= 40 && item.riskScore <= 70).length,
      },
      {
        name: 'High (>70)',
        value: transactions.filter((item) => item.riskScore > 70).length,
      },
    ];
  }, [transactionsQuery.data]);

  if (transactionsQuery.isLoading || flaggedQuery.isLoading || rulesQuery.isLoading) {
    return <LoadingState message="Loading dashboard analytics..." />;
  }

  if (transactionsQuery.isError) {
    return <ErrorState message="Failed to load dashboard transactions." onRetry={transactionsQuery.refetch} />;
  }

  const txCount = transactionsQuery.data?.length ?? 0;
  const flaggedCount = flaggedQuery.data?.length ?? 0;
  const activeRules = (rulesQuery.data ?? []).filter((rule) => rule.isActive).length;

  const copyToClipboard = async (label: string, value: string | null) => {
    if (!value) {
      showToast(`${label} is missing`, 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied`, 'success');
    } catch {
      showToast(`Could not copy ${label.toLowerCase()}`, 'error');
    }
  };

  return (
    <Stack spacing={3}>
      {isMerchant ? (
        <>
          <Box textAlign="center" py={2}>
            <Typography variant="h3" sx={{ fontWeight: 500, mb: 2 }}>
              Welcome, {displayName}
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }}
              gap={2}
            >
              <TextField
                label="API key"
                value={apiKeyDisplay}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Copy API key"
                        edge="end"
                        onClick={() => copyToClipboard('API key', session.apiKey)}
                      >
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Payment endpoint"
                value={paymentEndpoint}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Copy endpoint"
                        edge="end"
                        onClick={() => copyToClipboard('Endpoint', paymentEndpoint)}
                      >
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>
        </>
      ) : null}

      {canShowAnalytics ? (
        <>
          <Box>
            <Typography variant="h4" gutterBottom>
              Operations Dashboard
            </Typography>
            <Typography color="text.secondary">
              Overview of transaction health, risk profile, and active policy coverage.
            </Typography>
          </Box>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
          gap={2}
        >
          <div>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary">Transactions</Typography>
                <Typography variant="h4">{txCount}</Typography>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary">Flagged</Typography>
                <Typography variant="h4">{flaggedCount}</Typography>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary">Active Rules</Typography>
                <Typography variant="h4">{activeRules}</Typography>
              </CardContent>
            </Card>
          </div>
        </Box>
        </>
      ) : null}

      {canShowAnalytics ? (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}
          gap={2}
        >
          <div>
            <Card variant="outlined" sx={{ height: 320 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Transaction Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card variant="outlined" sx={{ height: 320 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Risk Score Segments
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {riskData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </Box>
      ) : null}

      {isMerchant ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Merchant ID: {merchantId ?? 'Missing'}
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
};
