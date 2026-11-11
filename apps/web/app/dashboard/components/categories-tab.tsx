import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeCategoryResponse } from '@ecomerece/shared';
import { IconByName } from '../../../components/icon-by-name';
import { HomeRowActions } from './home-row-actions';

export function CategoriesTab({
  categories,
  onEdit,
  onDelete,
  onMove,
}: {
  categories: HomeCategoryResponse[];
  onEdit: (category: HomeCategoryResponse) => void;
  onDelete: (category: HomeCategoryResponse) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2.5,
      }}
    >
      {categories.map((category, index) => (
        <Paper
          key={category.id}
          elevation={0}
          sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
        >
          <Box
            component="img"
            src={category.image}
            alt={category.name}
            sx={{ width: '100%', height: 150, objectFit: 'cover' }}
          />
          <Stack direction="row" spacing={1.5} sx={{ p: 2, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: `${category.accent}1f`, color: category.accent }}>
              <IconByName name={category.icon} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{category.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {category.id}
              </Typography>
            </Box>
            <HomeRowActions
              onEdit={() => onEdit(category)}
              onDelete={() => onDelete(category)}
              onMoveUp={() => onMove(index, -1)}
              onMoveDown={() => onMove(index, 1)}
              disableUp={index === 0}
              disableDown={index === categories.length - 1}
            />
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
