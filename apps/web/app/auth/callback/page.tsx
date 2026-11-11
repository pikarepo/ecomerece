'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { supabase } from '@ecomerece/frontend/supabase';
import { userService } from '@ecomerece/frontend/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../../components/auth-provider';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    let active = true;

    const finishSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        router.replace('/auth?error=Missing%20authorization%20code.');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const {
            data: { session: recoveredSession },
          } = await supabase.auth.getSession();
          if (!recoveredSession) {
            router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
            return;
          }
        }
      }

      try {
        await userService.initUser();
        await refresh();
      } catch (initError) {
        const message =
          initError instanceof Error ? initError.message : 'Unable to finish account setup.';
        router.replace(`/auth?error=${encodeURIComponent(message)}`);
        return;
      }

      const storedNext = window.sessionStorage.getItem('auth:next');
      window.sessionStorage.removeItem('auth:next');
      const destination =
        storedNext?.startsWith('/') && !storedNext.startsWith('//') ? storedNext : '/account';

      if (active) {
        router.replace(destination);
        router.refresh();
      }
    };

    void finishSignIn();

    return () => {
      active = false;
    };
  }, [refresh, router]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Finishing sign in…
        </Typography>
        <Typography color="text.secondary">
          Syncing your Supabase account with the marketplace user record.
        </Typography>
      </Stack>
    </Box>
  );
}
