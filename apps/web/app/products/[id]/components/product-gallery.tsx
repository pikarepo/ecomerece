'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { ProductResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';

export function ProductGallery({ product }: { product: ProductResponseReadModel }) {
  const images = product.image.images;
  const defaultIndex = Math.max(
    images.findIndex((image) => image.default),
    0,
  );
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return (
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderRadius: 2.5,
          bgcolor: 'grey.100',
          display: 'grid',
          placeItems: 'center',
          color: 'text.secondary',
        }}
      >
        No image
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'grey.100',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          src={activeImage.url}
          alt={activeImage.alt || product.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      {images.length > 1 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 1,
            mt: 1.5,
          }}
        >
          {images.map((image, index) => (
            <ButtonBase
              key={`${image.url}-${index}`}
              onClick={() => setActiveIndex(index)}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: index === activeIndex ? 'primary.main' : 'transparent',
                opacity: index === activeIndex ? 1 : 0.72,
              }}
            >
              <Box
                component="img"
                src={image.url}
                alt={image.alt || product.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </ButtonBase>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
