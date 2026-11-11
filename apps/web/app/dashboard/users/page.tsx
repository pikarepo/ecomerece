'use client';

import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { useGetAdminPaginatedUsers } from '@ecomerece/frontend/user';
import type { UserResponseReadModel, UserRolesType } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { UserActionDialog } from './components/user-action-dialog';
import { UserFilters } from './components/user-filters';
import { UserLookup } from './components/user-lookup';
import { UserTable } from './components/user-table';

export default function DashboardUsersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRolesType | ''>('');
  const [selectedUser, setSelectedUser] = useState<UserResponseReadModel | null>(null);
  const pager = useCursorPagination(20);
  const usersQuery = useGetAdminPaginatedUsers({
    search: search || undefined,
    role: role || undefined,
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Users"
      description="Pagination, search, and role filtering from the user module."
      actions={<Chip label={`${users.length} on this page`} color="primary" variant="outlined" />}
    >
      <DashboardNav />
      <UserFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={() => {
          setSearch(searchInput.trim());
          pager.reset();
        }}
        role={role}
        onRoleChange={(value) => {
          setRole(value);
          pager.reset();
        }}
        onReset={() => {
          setSearchInput('');
          setSearch('');
          setRole('');
          pager.reset();
        }}
      />

      <UserLookup onManage={setSelectedUser} />

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <QueryState
          isLoading={usersQuery.isPending}
          error={usersQuery.error}
          isEmpty={users.length === 0}
          emptyMessage="No users match these filters."
          onRetry={() => void usersQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <UserTable users={users} onManage={setSelectedUser} />
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={usersQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <UserActionDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuccess={() => void usersQuery.refetch()}
      />
    </PageShell>
  );
}
