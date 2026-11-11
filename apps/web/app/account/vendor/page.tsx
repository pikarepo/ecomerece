'use client';

import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PhoneIcon from '@mui/icons-material/Phone';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useGetMyVendor, useUpdateMyStatsRefresh } from '@ecomerece/frontend/vendor';
import type { VendorResponseReadModel as VendorReadModel } from '@ecomerece/shared';
import Link from 'next/link';
import { useState } from 'react';
import { PageShell } from '../../../components/page-shell';
import { CreateVendorDialog } from './components/create-vendor-dialog';
import { DeleteVendorDialog } from './components/delete-vendor-dialog';
import { VendorContactDialog } from './components/vendor-contact-dialog';
import { VendorImageDialog } from './components/vendor-image-dialog';
import { VendorMetaDialog } from './components/vendor-meta-dialog';
import { VendorStatsPanel } from './components/vendor-stats-panel';

type DialogName = 'meta' | 'contact' | 'images' | 'delete' | null;

function VendorProfile({ vendor }: { vendor: VendorReadModel }) {
  const [dialog, setDialog] = useState<DialogName>(null);
  const statsRefresh = useUpdateMyStatsRefresh();

  return (
    <>
      <Paper
        elevation={0}
        sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.100',
            backgroundImage: vendor.images.banner ? `url(${vendor.images.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{ p: { xs: 2.5, md: 3.5 }, alignItems: { md: 'center' } }}
        >
          <Box
            component="img"
            src={vendor.images.logo}
            alt={vendor.title}
            sx={{
              width: 88,
              height: 88,
              borderRadius: 2,
              objectFit: 'cover',
              bgcolor: 'grey.100',
              mt: { md: -9 },
              border: '4px solid',
              borderColor: 'background.paper',
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
              {vendor.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vendor.slug}
            </Typography>
            <Typography sx={{ mt: 1 }}>{vendor.description}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={vendor.verification.isVerified ? 'Verified' : 'Pending verification'}
                color={vendor.verification.isVerified ? 'success' : 'warning'}
                variant="outlined"
              />
              <Chip label={vendor.id} variant="outlined" />
            </Stack>
          </Box>
          <Stack spacing={1} sx={{ flexShrink: 0 }}>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setDialog('meta')}>
              Edit details
            </Button>
            <Button variant="outlined" startIcon={<PhoneIcon />} onClick={() => setDialog('contact')}>
              Edit contact
            </Button>
            <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => setDialog('images')}>
              Update images
            </Button>
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDialog('delete')}
            >
              Delete vendor
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Contact
          </Typography>
          <Typography variant="body2">{vendor.contact.email}</Typography>
          <Typography variant="body2">{vendor.contact.phone}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {vendor.contact.address.streetAddress}, {vendor.contact.address.city},{' '}
            {vendor.contact.address.state} {vendor.contact.address.postalCode},{' '}
            {vendor.contact.address.country}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Stats
          </Typography>
          <Box
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Views
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{vendor.stats?.views ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Purchases
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{vendor.stats?.purchases ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Revenue
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{vendor.stats?.revenue ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Refunds
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{vendor.stats?.refunds ?? 0}</Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={vendor.statsRefreshEnabled}
                disabled={statsRefresh.isPending}
                onChange={(event) =>
                  statsRefresh.mutate({ enabled: event.target.checked })
                }
              />
            }
            label="Auto-refresh stats"
          />
          {statsRefresh.error ? (
            <Typography variant="caption" color="error" sx={{ display: 'block' }}>
              {statsRefresh.error instanceof Error
                ? statsRefresh.error.message
                : 'Unable to update stats refresh.'}
            </Typography>
          ) : null}
        </Paper>
      </Box>

      <VendorStatsPanel vendorId={vendor.id} />

      <VendorMetaDialog
        vendor={vendor}
        open={dialog === 'meta'}
        onClose={() => setDialog(null)}
      />
      <VendorContactDialog
        vendor={vendor}
        open={dialog === 'contact'}
        onClose={() => setDialog(null)}
      />
      <VendorImageDialog
        vendor={vendor}
        open={dialog === 'images'}
        onClose={() => setDialog(null)}
      />
      <DeleteVendorDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onSuccess={() => undefined}
      />
    </>
  );
}

export default function AccountVendorPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const vendorQuery = useGetMyVendor();
  const vendor = vendorQuery.data;

  return (
    <PageShell
      requiresAuth
      eyebrow="Account"
      title="My vendor"
      description="Manage your storefront, contact details, images, and stats refresh."
      actions={
        <Button component={Link} href="/account" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to account
        </Button>
      }
    >
      {vendorQuery.isPending ? <Skeleton variant="rounded" height={420} /> : null}

      {!vendorQuery.isPending && vendor ? <VendorProfile vendor={vendor} /> : null}

      {!vendorQuery.isPending && !vendor ? (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Alert severity={vendorQuery.error ? 'warning' : 'info'}>
            {vendorQuery.error
              ? vendorQuery.error instanceof Error
                ? vendorQuery.error.message
                : 'Unable to load your vendor profile.'
              : 'You do not have a vendor storefront yet. Create one to start selling.'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<AddBusinessIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Create vendor
          </Button>
          {vendorQuery.error ? (
            <Button variant="outlined" onClick={() => void vendorQuery.refetch()}>
              Retry
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <CreateVendorDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => void vendorQuery.refetch()}
      />
    </PageShell>
  );
}
