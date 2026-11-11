'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'Home layout' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/categories', label: 'Categories' },
  { href: '/dashboard/inventory', label: 'Inventory' },
  { href: '/dashboard/variants', label: 'Variants' },
  { href: '/dashboard/vendors', label: 'Vendors' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/addresses', label: 'Addresses' },
  { href: '/dashboard/reviews', label: 'Reviews' },
  { href: '/dashboard/stats', label: 'Stats' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.75,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ minWidth: 'max-content' }}>
        {LINKS.map((link) => {
          const active =
            link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              size="small"
              color={active ? 'primary' : 'inherit'}
              sx={{
                px: 1.5,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.contrastText' : 'text.secondary',
                '&:hover': {
                  bgcolor: active ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {link.label}
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
}
