import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeCategoryResponse } from '@ecomerece/shared';
import { IconByName } from '../../../components/icon-by-name';
import { SectionHeading } from './section-heading';

export function CategoryGrid({ categories }: { categories: HomeCategoryResponse[] }) {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <SectionHeading
          eyebrow="Discover"
          title="Shop by category"
          subtitle="Curated collections from the live home layout, each with its own accent and artwork."
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
            mt: 4,
          }}
        >
          {categories.map((category) => (
            <Paper
              key={category.id}
              elevation={0}
              sx={{
                position: 'relative',
                minHeight: 210,
                borderRadius: 2.5,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-end',
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={category.image}
                alt={category.name}
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
                  background: `linear-gradient(145deg, ${category.accent}dd, ${category.accent}33)`,
                }}
              />
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ position: 'relative', color: '#fff', alignItems: 'center' }}
              >
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.22)', width: 48, height: 48 }}>
                  <IconByName name={category.icon} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Browse the collection
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
