'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGetVendorById } from '@ecomerece/frontend/vendor';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';

function VendorDetailLoading() {
  return (
    <Box sx={{ p: { xs: 3, md: 6 } }}>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}

export default function VendorDetailPage() {
  return (
    <Suspense fallback={<VendorDetailLoading />}>
      <VendorDetailContent />
    </Suspense>
  );
}

function VendorDetailContent() {
  const params = useParams<{ id: string }>();
  const vendorId = params?.id ?? '';
  const vendorQuery = useGetVendorById(vendorId);
  const vendor = vendorQuery.data;

  return (
    <PageShell
      eyebrow="Vendor"
      title={vendor?.title ?? 'Vendor details'}
      description={vendor?.slug}
      actions={
        <>
          <Button component={Link} href="/vendors" startIcon={<ArrowBackIcon />} variant="outlined">
            All vendors
          </Button>
          <Button component={Link} href={`/products?vendorId=${vendorId}`} variant="contained">
            Shop products
          </Button>
        </>
      }
    >
      <QueryState
        isLoading={vendorQuery.isPending}
        error={vendorQuery.error}
        onRetry={() => void vendorQuery.refetch()}
        skeleton={<Skeleton variant="rounded" height={460} />}
      >
        {vendor ? (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: 220,
                  backgroundColor: 'grey.100',
                  backgroundImage: vendor.images.banner
                    ? `url(${vendor.images.banner})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2.5}
                sx={{ p: { xs: 2.5, md: 4 }, alignItems: 'flex-start' }}
              >
                <Box
                  component="img"
                  src={vendor.images.logo}
                  alt={vendor.title}
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: 2,
                    objectFit: 'cover',
                    bgcolor: 'grey.100',
                    mt: { sm: -8 },
                    border: '4px solid',
                    borderColor: 'background.paper',
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
                    {vendor.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {vendor.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={vendor.verification.isVerified ? 'Verified' : 'Pending verification'}
                      color={vendor.verification.isVerified ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </QueryState>
    </PageShell>
  );
}
