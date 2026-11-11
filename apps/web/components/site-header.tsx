'use client';

import StorefrontIcon from '@mui/icons-material/Storefront';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';

const PUBLIC_NAV = [
  { href: '/', label: 'Storefront' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/reviews', label: 'Reviews' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, signOut, role } = useAuth();
  const privateNav = [
    ...(isAuthenticated ? [{ href: '/account', label: 'Account' }] : []),
    ...(role === 'admin' || role === 'vendor'
      ? [{ href: '/dashboard', label: 'Admin' }]
      : []),
  ];

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
          <Box sx={{ lineHeight: 1.1, display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Ecomerece</Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary' }}>Storefront</Box>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            flex: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {PUBLIC_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                color={active ? 'primary' : 'inherit'}
                sx={{
                  px: 1.75,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
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

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          {privateNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                sx={{ px: 1.5, whiteSpace: 'nowrap' }}
              >
                {item.label}
              </Button>
            );
          })}
          {isAuthenticated ? (
            <Button
              size="small"
              color="inherit"
              onClick={() => void signOut()}
              sx={{ px: 1.5, whiteSpace: 'nowrap' }}
            >
              Sign out
            </Button>
          ) : (
            <Button
              component={Link}
              href="/auth"
              size="small"
              variant="contained"
              sx={{ px: 1.5, whiteSpace: 'nowrap' }}
            >
              Sign in
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
