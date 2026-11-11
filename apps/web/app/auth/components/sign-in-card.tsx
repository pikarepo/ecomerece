'use client';

import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

export function SignInCard({
  error,
  isAuthenticated,
  isLoading,
  isSigningIn,
  onSignIn,
}: {
  error?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  onSignIn: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 460,
        mx: 'auto',
        p: { xs: 3, md: 4 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlinedIcon />
        </Avatar>

        <Stack spacing={0.75}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Sign in
          </Typography>
          <Typography color="text.secondary">
            Use your Google account to access orders, addresses, and account tools.
          </Typography>
        </Stack>

        {error ? <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert> : null}

        {isAuthenticated ? (
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Alert severity="success">You are already signed in.</Alert>
            <Button component={NextLink} href="/account" variant="contained" size="large">
              Go to account
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={onSignIn}
            disabled={isSigningIn || isLoading}
            sx={{ width: '100%' }}
          >
            {isSigningIn ? 'Redirecting…' : isLoading ? 'Checking session…' : 'Continue with Google'}
          </Button>
        )}

        <Typography variant="caption" color="text.secondary">
          By continuing you agree to the marketplace terms and privacy policy.
        </Typography>
        <Link component={NextLink} href="/" variant="body2">
          Back to storefront
        </Link>
      </Stack>
    </Paper>
  );
}
