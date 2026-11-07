import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function HomeFooter({ version, isFetching }: { version: number; isFetching: boolean }) {
  return (
    <Box
      component="footer"
      sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between' }}
        >
          <Typography variant="body2" color="text.secondary">
            Ecomerece — multi-vendor beauty storefront
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isFetching ? 'Refreshing layout…' : `Layout version ${version}`}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
