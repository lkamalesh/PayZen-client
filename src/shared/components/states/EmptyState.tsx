import { Box, Button, Typography } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <Box textAlign="center" py={8} px={2}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description ? (
      <Typography color="text.secondary" mb={2}>
        {description}
      </Typography>
    ) : null}
    {actionLabel && onAction ? (
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </Box>
);
