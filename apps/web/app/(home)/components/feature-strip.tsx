import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeFeatureResponse } from '@ecomerece/shared';
import { IconByName } from '../../../components/icon-by-name';

export function FeatureStrip({ features }: { features: HomeFeatureResponse[] }) {
  return (
    <Box
      component="section"
      sx={{ py: 7, bgcolor: 'background.paper', borderBlock: '1px solid', borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 4,
          }}
        >
          {features.map((feature) => (
            <Stack key={feature.id} spacing={1.5}>
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: `${feature.accent}1f`,
                  color: feature.accent,
                }}
              >
                <IconByName name={feature.icon} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.detail}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
