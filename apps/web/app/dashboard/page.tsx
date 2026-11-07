'use client';

import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useGetHomeLayout } from '@ecomerece/frontend/home';
import { useState } from 'react';
import { SiteHeader } from '../../components/site-header';
import { CategoriesTab } from './components/categories-tab';
import { FeaturesTab } from './components/features-tab';
import { OverviewTab } from './components/overview-tab';
import { PromosTab } from './components/promos-tab';
import { RawJsonTab } from './components/raw-json-tab';
import { ShelvesTab } from './components/shelves-tab';
import { SlidesTab } from './components/slides-tab';
import { StatCard } from './components/stat-card';

const TABS = ['Overview', 'Slides', 'Promos', 'Categories', 'Features', 'Shelves', 'Raw JSON'];

export default function DashboardPage() {
  const { data: layout, error, isFetching, refetch } = useGetHomeLayout();
  const [tab, setTab] = useState(0);

  const errorMessage =
    error instanceof Error ? error.message : error ? 'Unable to load the home layout.' : null;

  if (!layout) {
    return (
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <SiteHeader />
        {errorMessage ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        ) : null}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="text" width="30%" height={56} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
              gap: 2,
              mt: 3,
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={108} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={360} sx={{ mt: 3 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <SiteHeader />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}
            >
              Admin
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              Home layout dashboard
            </Typography>
            <Typography color="text.secondary">
              Read-only overview of the live home aggregate served by the Hono API.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={`v${layout.version}`} color="primary" variant="outlined" />
            <Button
              variant="contained"
              startIcon={
                isFetching ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
              }
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {errorMessage ? (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Showing the last loaded layout. {errorMessage}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
            gap: 2,
            mt: 4,
          }}
        >
          <StatCard label="Slides" value={layout.slides.length} accent="#7c3aed" icon="Sparkles" />
          <StatCard label="Promos" value={layout.promos.length} accent="#db2777" icon="Star" />
          <StatCard
            label="Categories"
            value={layout.categories.length}
            accent="#0891b2"
            icon="Box"
          />
          <StatCard
            label="Features"
            value={layout.features.length}
            accent="#16a34a"
            icon="ShieldCheck"
          />
          <StatCard
            label="Shelves"
            value={layout.productContainers.length}
            accent="#ea580c"
            icon="Truck"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: number) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {TABS.map((label) => (
              <Tab key={label} label={label} sx={{ fontWeight: 700 }} />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {tab === 0 ? <OverviewTab layout={layout} /> : null}
            {tab === 1 ? <SlidesTab slides={layout.slides} /> : null}
            {tab === 2 ? <PromosTab promos={layout.promos} /> : null}
            {tab === 3 ? <CategoriesTab categories={layout.categories} /> : null}
            {tab === 4 ? <FeaturesTab features={layout.features} /> : null}
            {tab === 5 ? <ShelvesTab containers={layout.productContainers} /> : null}
            {tab === 6 ? <RawJsonTab layout={layout} /> : null}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
