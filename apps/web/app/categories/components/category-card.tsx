import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { categoryResponseReadModels } from '@ecomerece/shared';
import Link from 'next/link';

export function CategoryCard({ category }: { category: categoryResponseReadModels }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        transition: 'box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 40px rgba(23, 19, 33, 0.12)',
        },
      }}
    >
      <Box
        component={Link}
        href={`/categories/${category.id}`}
        sx={{ color: 'inherit', textDecoration: 'none', display: 'block', height: '100%' }}
      >
        <Box sx={{ aspectRatio: '16 / 10', bgcolor: 'grey.100' }}>
          {category.image ? (
            <Box
              component="img"
              src={category.image}
              alt={category.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {category.title}
          </Typography>
          <Chip
            size="small"
            label={category.idBlocked ? 'Blocked' : 'View category'}
            color={category.idBlocked ? 'warning' : 'default'}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
}
