'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { UserResponseReadModel, UserRolesType } from '@ecomerece/shared';
import {
  useAssignRole,
  useBanLift,
  useBanUser,
  useBlockLift,
  useBlockUser,
  useExtendBan,
  useRecoverUser,
  useShortenBan,
  useSoftDeleteUser,
} from '@ecomerece/frontend/user';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const ACTIONS = [
  { value: 'assignRole', label: 'Assign role' },
  { value: 'block', label: 'Block user' },
  { value: 'blockLift', label: 'Lift block' },
  { value: 'ban', label: 'Ban user' },
  { value: 'banLift', label: 'Lift ban' },
  { value: 'extendBan', label: 'Extend ban' },
  { value: 'shortenBan', label: 'Shorten ban' },
  { value: 'delete', label: 'Soft delete' },
  { value: 'recover', label: 'Recover' },
] as const;

type Action = (typeof ACTIONS)[number]['value'];

const REASON_ACTIONS: Action[] = ['assignRole', 'block', 'ban', 'delete'];
const DAY_ACTIONS: Action[] = ['ban', 'extendBan', 'shortenBan'];

export function UserActionDialog({
  user,
  onClose,
  onSuccess,
}: {
  user: UserResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<Action>('assignRole');
  const [role, setRole] = useState<UserRolesType>('customer');
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('7');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const assignRole = useAssignRole();
  const blockUser = useBlockUser();
  const blockLift = useBlockLift();
  const banUser = useBanUser();
  const banLift = useBanLift();
  const extendBan = useExtendBan();
  const shortenBan = useShortenBan();
  const deleteUser = useSoftDeleteUser();
  const recoverUser = useRecoverUser();

  const mutations = [
    assignRole,
    blockUser,
    blockLift,
    banUser,
    banLift,
    extendBan,
    shortenBan,
    deleteUser,
    recoverUser,
  ];
  const isSubmitting = mutations.some((mutation) => mutation.isPending);

  const reset = () => {
    setAction('assignRole');
    setRole('customer');
    setReason('');
    setDays('7');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);

    if (REASON_ACTIONS.includes(action) && reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }
    if (DAY_ACTIONS.includes(action) && Number(days) < 1) {
      setError('Days must be at least 1.');
      return;
    }

    try {
      let result;
      switch (action) {
        case 'assignRole':
          result = await assignRole.mutateAsync({ userId: user.id, role, reason: reason.trim() });
          break;
        case 'block':
          result = await blockUser.mutateAsync({ userId: user.id, reason: reason.trim() });
          break;
        case 'blockLift':
          result = await blockLift.mutateAsync(user.id);
          break;
        case 'ban':
          result = await banUser.mutateAsync({
            userId: user.id,
            forDays: Number(days),
            reason: reason.trim(),
          });
          break;
        case 'banLift':
          result = await banLift.mutateAsync(user.id);
          break;
        case 'extendBan':
          result = await extendBan.mutateAsync({ userId: user.id, forDays: Number(days) });
          break;
        case 'shortenBan':
          result = await shortenBan.mutateAsync({ userId: user.id, forDays: Number(days) });
          break;
        case 'delete':
          result = await deleteUser.mutateAsync({ userId: user.id, reason: reason.trim() });
          break;
        case 'recover':
          result = await recoverUser.mutateAsync(user.id);
          break;
      }
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to update this user.',
      );
    }
  };

  return (
    <FormDialog
      title={user ? `Manage ${user.fullName}` : 'Manage user'}
      open={Boolean(user)}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel="Run action"
    >
      <TextField
        select
        label="Action"
        value={action}
        onChange={(event) => {
          setAction(event.target.value as Action);
          setSuccess(null);
        }}
        fullWidth
      >
        {ACTIONS.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>

      {action === 'assignRole' ? (
        <TextField
          select
          label="Role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRolesType)}
          fullWidth
        >
          {(['customer', 'vendor', 'admin'] as UserRolesType[]).map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      ) : null}

      {REASON_ACTIONS.includes(action) ? (
        <TextField
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          helperText="At least 10 characters."
          multiline
          minRows={2}
          fullWidth
        />
      ) : null}

      {DAY_ACTIONS.includes(action) ? (
        <TextField
          label="Days"
          type="number"
          value={days}
          onChange={(event) => setDays(event.target.value)}
          slotProps={{ htmlInput: { min: 1 } }}
          fullWidth
        />
      ) : null}
    </FormDialog>
  );
}
