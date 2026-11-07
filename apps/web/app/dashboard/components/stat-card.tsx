import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconByName } from '../../../components/icon-by-name';

export function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${accent}1f`, color: accent }}>
          <IconByName name={icon} />
        </Avatar>
      </Stack>
    </Paper>
  );
}
