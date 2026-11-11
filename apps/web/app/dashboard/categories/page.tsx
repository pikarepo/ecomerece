'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetAdminPaginatedCategories } from '@ecomerece/frontend/category';
import type { categoryResponseReadModels } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { CategoryDeleteDialog } from './components/category-delete-dialog';
import { CategoryFormDialog } from './components/category-form-dialog';

type BooleanFilter = '' | 'true' | 'false';

export default function DashboardCategoriesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<BooleanFilter>('');
  const [blocked, setBlocked] = useState<BooleanFilter>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<categoryResponseReadModels | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<categoryResponseReadModels | null>(null);
  const pager = useCursorPagination(20);

  const categoriesQuery = useGetAdminPaginatedCategories({
    search: search || undefined,
    deleted: deleted === '' ? undefined : deleted === 'true',
    blocked: blocked === '' ? undefined : blocked === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const categories = categoriesQuery.data?.data ?? [];
  const meta = categoriesQuery.data?.meta;

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Categories"
      description="Create, update, search, and soft-delete categories."
      actions={
        <>
          <Chip label={`${categories.length} on this page`} color="primary" variant="outlined" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            New category
          </Button>
        </>
      }
    >
      <DashboardNav />

      <Paper
        elevation={0}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
          pager.reset();
        }}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          label="Search categories"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ flex: '1 1 220px' }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Deleted"
          value={deleted}
          onChange={(event) => {
            setDeleted(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Active only</MenuItem>
          <MenuItem value="true">Deleted only</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Blocked"
          value={blocked}
          onChange={(event) => {
            setBlocked(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Not blocked</MenuItem>
          <MenuItem value="true">Blocked only</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Search
        </Button>
        <Button
          type="button"
          color="inherit"
          onClick={() => {
            setSearchInput('');
            setSearch('');
            setDeleted('');
            setBlocked('');
            pager.reset();
          }}
        >
          Reset
        </Button>
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <QueryState
          isLoading={categoriesQuery.isPending}
          error={categoriesQuery.error}
          isEmpty={categories.length === 0}
          emptyMessage="No categories match these filters."
          onRetry={() => void categoriesQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={category.image}
                          alt={category.title}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {category.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {category.isDeleted ? (
                          <Chip size="small" label="Deleted" color="error" />
                        ) : null}
                        {category.idBlocked ? (
                          <Chip size="small" label="Blocked" color="warning" />
                        ) : null}
                        {!category.isDeleted && !category.idBlocked ? (
                          <Chip size="small" label="Active" color="success" />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditingCategory(category);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {!category.isDeleted ? (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeletingCategory(category)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={categoriesQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <CategoryFormDialog
        category={editingCategory}
        open={formOpen}
        onClose={closeForm}
        onSuccess={() => void categoriesQuery.refetch()}
      />
      <CategoryDeleteDialog
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onSuccess={() => void categoriesQuery.refetch()}
      />
    </PageShell>
  );
}
