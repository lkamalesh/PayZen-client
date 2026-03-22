import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingState } from '@/shared/components/states/LoadingState';

interface AiExplanationDrawerProps {
  open: boolean;
  loading: boolean;
  transactionId: string | null;
  explanation: string | null;
  onClose: () => void;
}

interface ParsedExplanation {
  intro: string[];
  reasons: string[];
  summary: string | null;
}

interface ReasonContent {
  body: string;
  source: string | null;
}

const splitReasonAndSource = (text: string): ReasonContent => {
  const sourceIndex = text.search(/\bSource:\s*/i);
  if (sourceIndex < 0) {
    return { body: text, source: null };
  }

  const body = text.slice(0, sourceIndex).trim();
  const source = text
    .slice(sourceIndex)
    .replace(/\s+/g, ' ')
    .trim();

  return {
    body,
    source: source.length > 0 ? source : null,
  };
};

const parseExplanation = (raw: string | null): ParsedExplanation => {
  if (!raw) {
    return { intro: [], reasons: [], summary: null };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const intro: string[] = [];
  const reasons: string[] = [];
  let summary: string | null = null;
  let currentReason = '';

  for (const line of lines) {
    const isNumberedReason = /^\d+\.\s+/.test(line);
    const isSummary = /^in summary[:\s]/i.test(line);

    if (isSummary) {
      if (currentReason) {
        reasons.push(currentReason.trim());
        currentReason = '';
      }
      summary = line;
      continue;
    }

    if (isNumberedReason) {
      if (currentReason) {
        reasons.push(currentReason.trim());
      }
      currentReason = line;
      continue;
    }

    if (currentReason) {
      currentReason += ` ${line}`;
    } else if (!summary) {
      intro.push(line);
    }
  }

  if (currentReason) {
    reasons.push(currentReason.trim());
  }

  return { intro, reasons, summary };
};

export const AiExplanationDrawer = ({
  open,
  loading,
  transactionId,
  explanation,
  onClose,
}: AiExplanationDrawerProps) => {
  const parsed = parseExplanation(explanation);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        role="dialog"
        aria-label="AI risk explanation"
        sx={{
          width: { xs: '100vw', sm: 720 },
          maxWidth: '100vw',
          p: { xs: 2, sm: 3 },
          backgroundColor: '#f8fafc',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              AI Risk Explanation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction: {transactionId ?? 'N/A'}
            </Typography>
          </div>
          <IconButton aria-label="Close explanation" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          {loading ? <LoadingState message="Analyzing risk narrative..." /> : null}

          {!loading && !explanation ? (
            <Alert severity="info">No AI explanation is available for this transaction yet.</Alert>
          ) : null}

          {!loading && explanation ? (
            <Stack spacing={2}>
              {parsed.intro.map((paragraph) => (
                <Typography key={paragraph} variant="body1" color="text.primary">
                  {paragraph}
                </Typography>
              ))}

              {parsed.reasons.length > 0 ? (
                <>
                  <Divider />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Risk Reasons
                  </Typography>
                  <List sx={{ listStyleType: 'decimal', pl: 3 }}>
                    {parsed.reasons.map((reason, index) => {
                      const cleaned = reason.replace(/^\d+\.\s+/, '');
                      const { body, source } = splitReasonAndSource(cleaned);
                      return (
                        <ListItem key={`${index}-${cleaned}`} sx={{ display: 'list-item', py: 0.8 }}>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography variant="body1" color="text.primary">
                                  {body}
                                </Typography>
                                {source ? (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {source}
                                  </Typography>
                                ) : null}
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              ) : null}

              {parsed.summary ? (
                <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Summary
                  </Typography>
                  <Typography variant="body2">{parsed.summary.replace(/^in summary[:\s]*/i, '')}</Typography>
                </Alert>
              ) : null}

            </Stack>
          ) : null}
        </Paper>
      </Box>
    </Drawer>
  );
};
