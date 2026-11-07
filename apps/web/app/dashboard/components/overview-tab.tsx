import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeResponseReadModel } from '@ecomerece/shared';
import { DetailRow } from './detail-row';
import { Panel } from './panel';

export function OverviewTab({ layout }: { layout: HomeResponseReadModel }) {
  const containers = [...layout.productContainers].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2.5,
      }}
    >
      <Panel title="Document">
        <Stack spacing={1.25}>
          <DetailRow label="ID" value={layout.id} />
          <DetailRow label="Version" value={String(layout.version)} />
          <DetailRow label="Updated at" value={String(layout.updatedAt)} />
          <DetailRow label="Slides" value={String(layout.slides.length)} />
          <DetailRow label="Promos" value={String(layout.promos.length)} />
          <DetailRow label="Categories" value={String(layout.categories.length)} />
          <DetailRow label="Features" value={String(layout.features.length)} />
          <DetailRow label="Product containers" value={String(layout.productContainers.length)} />
        </Stack>
      </Panel>

      <Panel title="Shelf configuration">
        <Stack spacing={2}>
          {containers.map((container) => (
            <Box key={container.id}>
              <Typography sx={{ fontWeight: 700 }}>{container.heading}</Typography>
              <Typography variant="body2" color="text.secondary">
                {container.subTitle}
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={`order ${container.displayOrder}`} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`limit ${container.query.limit ?? 20}`}
                />
                {container.query.sort
                  ? Object.entries(container.query.sort).map(([key, value]) => (
                      <Chip key={key} size="small" variant="outlined" label={`${key}: ${value}`} />
                    ))
                  : null}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Panel>
    </Box>
  );
}
