import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
