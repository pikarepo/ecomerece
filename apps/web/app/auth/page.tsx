'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAuth } from '../../components/auth-provider';
import { PageShell } from '../../components/page-shell';
import { SignInCard } from './components/sign-in-card';

function AuthLoading() {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', p: { xs: 3, md: 8 } }}>
      <Skeleton variant="rounded" height={420} sx={{ maxWidth: 460, mx: 'auto' }} />
    </Box>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthRoute />
    </Suspense>
  );
}

function AuthRoute() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const nextPath = searchParams.get('next');

  return (
    <PageShell
      eyebrow="Account"
      title="Authentication"
      description="Sign in with the same Supabase session used by the API."
    >
      <SignInCardRoute error={errorParam} nextPath={nextPath} />
    </PageShell>
  );
}

function SignInCardRoute({ error, nextPath }: { error: string | null; nextPath: string | null }) {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      if (nextPath?.startsWith('/') && !nextPath.startsWith('//')) {
        window.sessionStorage.setItem('auth:next', nextPath);
      }
      await signIn();
    } catch (signInFailure) {
      setSignInError(
        signInFailure instanceof Error ? signInFailure.message : 'Unable to start sign in.',
      );
      setIsSigningIn(false);
    }
  };

  return (
    <SignInCard
      error={signInError ?? error}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      isSigningIn={isSigningIn}
      onSignIn={() => void handleSignIn()}
    />
  );
}
