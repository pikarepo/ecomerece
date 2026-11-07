import Box from '@mui/material/Box';
import type { HomeResponseReadModel } from '@ecomerece/shared';

export function RawJsonTab({ layout }: { layout: HomeResponseReadModel }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2.5,
        bgcolor: '#0f1020',
        color: '#d6d8f0',
        borderRadius: 2,
        fontSize: 12.5,
        lineHeight: 1.6,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(layout, null, 2)}
    </Box>
  );
}
