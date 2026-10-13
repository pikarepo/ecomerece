import { useGetMe, useSoftDeleteMe } from '@ecomerece/frontend/user';

export function useProfileManager() {
  const { data: user, isLoading, error, refetch, isFetching } = useGetMe();
  const {
    mutate: deleteAccount,
    isPending: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useSoftDeleteMe();

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return {
    user,
    isLoading,
    error,
    refetch,
    isFetching,
    deleteAccount,
    isDeleting,
    deleteError,
    resetDelete,
    formatDate,
  };
}
