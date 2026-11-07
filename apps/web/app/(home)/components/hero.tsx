'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeSlideResponse } from '@ecomerece/shared';
import { useState } from 'react';

export function Hero({ slides }: { slides: HomeSlideResponse[] }) {
  const [active, setActive] = useState(0);
  const slide = slides[Math.min(active, Math.max(slides.length - 1, 0))];

  if (!slide) return null;

  return (
    <Box
      component="section"
      sx={{
        background: `linear-gradient(135deg, ${slide.accent}22, #ffffff 62%)`,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={2.5}>
            <Chip
              label={slide.tag}
              sx={{ alignSelf: 'flex-start', bgcolor: slide.accent, color: '#fff', px: 1 }}
            />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.35rem', md: '3.9rem' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
              }}
            >
              {slide.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              {slide.subhead}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
              {slide.subtitle}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                size="large"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: slide.accent,
                  '&:hover': { bgcolor: slide.accent, filter: 'brightness(0.92)' },
                }}
              >
                {slide.cta}
              </Button>
              {slides.length > 1 ? (
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => setActive((current) => (current + 1) % slides.length)}
                >
                  Next highlight
                </Button>
              ) : null}
            </Stack>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 270, md: 410 },
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 30px 70px rgba(20, 12, 45, 0.22)',
              bgcolor: `${slide.accent}18`,
            }}
          >
            <Box
              component="img"
              src={slide.image}
              alt={slide.title}
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
                background: `linear-gradient(200deg, transparent 35%, ${slide.accent}66)`,
              }}
            />
          </Box>
        </Box>

        {slides.length > 1 ? (
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ mt: 4, overflowX: 'auto', pb: 1, scrollbarWidth: 'thin' }}
          >
            {slides.map((item, index) => {
              const isActive = item.id === slide.id;
              return (
                <ButtonBase
                  key={item.id}
                  onClick={() => setActive(index)}
                  sx={{
                    flex: '0 0 auto',
                    width: 116,
                    height: 68,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: isActive ? item.accent : 'transparent',
                    opacity: isActive ? 1 : 0.62,
                    transition: 'opacity 160ms ease, border-color 160ms ease',
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </ButtonBase>
              );
            })}
          </Stack>
        ) : null}
      </Container>
    </Box>
  );
}
