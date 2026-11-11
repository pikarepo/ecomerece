import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { RequireAuth } from './require-auth';
import { SiteHeader } from './site-header';

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  requiresAuth = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  requiresAuth?: boolean;
  children: ReactNode;
}) {
  const content = (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <SiteHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
          }}
        >
          <Box>
            {eyebrow ? (
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}
              >
                {eyebrow}
              </Typography>
            ) : null}
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {title}
            </Typography>
            {description ? <Typography color="text.secondary">{description}</Typography> : null}
          </Box>
          {actions ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {actions}
            </Stack>
          ) : null}
        </Stack>
        {children}
      </Container>
    </Box>
  );

  return requiresAuth ? <RequireAuth>{content}</RequireAuth> : content;
}
