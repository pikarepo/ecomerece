'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StorefrontIcon from '@mui/icons-material/Storefront';

const NAV = [
  { href: '/', label: 'Storefront' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 72 } }}>
        <Stack
          component={Link}
          href="/"
          direction="row"
          spacing={1}
          sx={{ textDecoration: 'none', color: 'inherit', alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
            }}
          >
            <StorefrontIcon fontSize="small" />
          </Box>
          <Box sx={{ lineHeight: 1.1 }}>
            <Box sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Ecomerece</Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary' }}>Storefront</Box>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ ml: { xs: 'auto', md: 2 }, flex: 1 }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                color={active ? 'primary' : 'inherit'}
                sx={{
                  px: 1.75,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Chip
          size="small"
          label="Material UI"
          variant="outlined"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        />
      </Toolbar>
    </AppBar>
  );
}
