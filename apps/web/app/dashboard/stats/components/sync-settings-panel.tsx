'use client';

import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { StatsSyncSettings } from '@ecomerece/frontend/stats';
import { useState } from 'react';

export function SyncSettingsPanel({
  settings,
  isSaving,
  error,
  onSave,
}: {
  settings: StatsSyncSettings;
  isSaving: boolean;
  error: unknown;
  onSave: (input: {
    intervalHours: number;
    maxStalenessHours: number;
    vendorForceRefreshQuota: number;
    autoDenormalizeEnabled: boolean;
  }) => void;
}) {
  const [intervalHours, setIntervalHours] = useState(String(settings.intervalHours));
  const [maxStalenessHours, setMaxStalenessHours] = useState(String(settings.maxStalenessHours));
  const [vendorForceRefreshQuota, setVendorForceRefreshQuota] = useState(
    String(settings.vendorForceRefreshQuota),
  );
  const [autoDenormalizeEnabled, setAutoDenormalizeEnabled] = useState(
    settings.autoDenormalizeEnabled,
  );

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        Sync settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Controls for the stats aggregation pipeline.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Unable to save settings.'}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          type="number"
          label="Interval hours"
          value={intervalHours}
          onChange={(event) => setIntervalHours(event.target.value)}
        />
        <TextField
          size="small"
          type="number"
          label="Max staleness hours"
          value={maxStalenessHours}
          onChange={(event) => setMaxStalenessHours(event.target.value)}
        />
        <TextField
          size="small"
          type="number"
          label="Vendor refresh quota"
          value={vendorForceRefreshQuota}
          onChange={(event) => setVendorForceRefreshQuota(event.target.value)}
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={autoDenormalizeEnabled}
              onChange={(event) => setAutoDenormalizeEnabled(event.target.checked)}
            />
          }
          label="Auto denormalize"
        />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isSaving}
          onClick={() =>
            onSave({
              intervalHours: Number(intervalHours),
              maxStalenessHours: Number(maxStalenessHours),
              vendorForceRefreshQuota: Number(vendorForceRefreshQuota),
              autoDenormalizeEnabled,
            })
          }
        >
          {isSaving ? 'Saving…' : 'Save settings'}
        </Button>
      </Stack>
    </Paper>
  );
}
