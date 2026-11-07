import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomePromoResponse } from '@ecomerece/shared';
import { SectionHeading } from './section-heading';

export function PromoGrid({ promos }: { promos: HomePromoResponse[] }) {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <SectionHeading
          eyebrow="Offers"
          title="Featured promotions"
          subtitle="Campaign cards rendered straight from the home document."
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mt: 4,
          }}
        >
          {promos.map((promo) => (
            <Paper
              key={promo.id}
              elevation={0}
              sx={{
                position: 'relative',
                minHeight: 250,
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={promo.image}
                alt={promo.title}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(160deg, ${promo.accent}e6, ${promo.accent}55)`,
                }}
              />
              <Stack
                spacing={1}
                sx={{
                  position: 'relative',
                  minHeight: 250,
                  p: 3.5,
                  justifyContent: 'flex-end',
                  color: '#fff',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {promo.title}
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 420, opacity: 0.9 }}>
                  {promo.subtitle}
                </Typography>
                <Button
                  component="a"
                  href={promo.link}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    alignSelf: 'flex-start',
                    mt: 1.5,
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                  }}
                >
                  Shop now
                </Button>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
