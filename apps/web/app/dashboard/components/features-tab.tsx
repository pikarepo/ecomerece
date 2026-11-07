import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeFeatureResponse } from '@ecomerece/shared';
import { IconByName } from '../../../components/icon-by-name';

export function FeaturesTab({ features }: { features: HomeFeatureResponse[] }) {
  return (
    <Stack spacing={2} divider={<Divider />}>
      {features.map((feature) => (
        <Stack key={feature.id} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: `${feature.accent}1f`, color: feature.accent }}>
            <IconByName name={feature.icon} />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{feature.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.detail}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
