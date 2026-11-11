import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeFeatureResponse } from '@ecomerece/shared';
import { IconByName } from '../../../components/icon-by-name';
import { HomeRowActions } from './home-row-actions';

export function FeaturesTab({
  features,
  onEdit,
  onDelete,
  onMove,
}: {
  features: HomeFeatureResponse[];
  onEdit: (feature: HomeFeatureResponse) => void;
  onDelete: (feature: HomeFeatureResponse) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <Stack spacing={2} divider={<Divider />}>
      {features.map((feature, index) => (
        <Stack key={feature.id} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: `${feature.accent}1f`, color: feature.accent }}>
            <IconByName name={feature.icon} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{feature.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.detail}
            </Typography>
          </Box>
          <HomeRowActions
            onEdit={() => onEdit(feature)}
            onDelete={() => onDelete(feature)}
            onMoveUp={() => onMove(index, -1)}
            onMoveDown={() => onMove(index, 1)}
            disableUp={index === 0}
            disableDown={index === features.length - 1}
          />
        </Stack>
      ))}
    </Stack>
  );
}
