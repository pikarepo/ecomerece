import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
