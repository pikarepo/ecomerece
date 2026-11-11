'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGetCategoryById } from '@ecomerece/frontend/category';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';

function CategoryDetailLoading() {
  return (
    <Box sx={{ p: { xs: 3, md: 6 } }}>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<CategoryDetailLoading />}>
      <CategoryDetailContent />
    </Suspense>
  );
}

function CategoryDetailContent() {
  const params = useParams<{ id: string }>();
  const categoryId = params?.id ?? '';
  const categoryQuery = useGetCategoryById(categoryId);
  const category = categoryQuery.data;

  return (
    <PageShell
      eyebrow="Category"
      title={category?.title ?? 'Category details'}
      description="Category detail loaded from the category module."
      actions={
        <>
          <Button component={Link} href="/categories" startIcon={<ArrowBackIcon />} variant="outlined">
            All categories
          </Button>
          <Button component={Link} href={`/products?categoryId=${categoryId}`} variant="contained">
            Browse products
          </Button>
        </>
      }
    >
      <QueryState
        isLoading={categoryQuery.isPending}
        error={categoryQuery.error}
        onRetry={() => void categoryQuery.refetch()}
        skeleton={<Skeleton variant="rounded" height={420} />}
      >
        {category ? (
          <Paper
            elevation={0}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ minHeight: 320, bgcolor: 'grey.100' }}>
              <Box
                component="img"
                src={category.image}
                alt={category.title}
                sx={{ width: '100%', height: '100%', maxHeight: 520, objectFit: 'cover' }}
              />
            </Box>
            <Stack spacing={2} sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
                {category.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label={category.isDeleted ? 'Deleted' : 'Active'}
                  color={category.isDeleted ? 'error' : 'success'}
                  variant="outlined"
                />
                {category.idBlocked ? (
                  <Chip label="Blocked" color="warning" variant="outlined" />
                ) : null}
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {category.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(category.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ) : null}
      </QueryState>
    </PageShell>
  );
}
