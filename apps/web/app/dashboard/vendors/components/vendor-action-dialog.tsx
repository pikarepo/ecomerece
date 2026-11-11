'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  useRecoverVendor,
  useRejectVendorVerification,
  useSoftDeleteVendor,
  useVerifyVendor,
} from '@ecomerece/frontend/vendor';
import type { VendorListItemReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const ACTIONS = [
  { value: 'verify', label: 'Verify vendor' },
  { value: 'reject', label: 'Reject verification' },
  { value: 'delete', label: 'Soft delete vendor' },
  { value: 'recover', label: 'Recover vendor' },
] as const;

type Action = (typeof ACTIONS)[number]['value'];

export function VendorActionDialog(props: {
  vendor: VendorListItemReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <VendorActionDialogContent key={props.vendor?.id ?? 'closed'} {...props} />;
}

function VendorActionDialogContent({
  vendor,
  onClose,
  onSuccess,
}: {
  vendor: VendorListItemReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<Action>(
    vendor?.verification?.isVerified ? 'delete' : 'verify',
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const verifyVendor = useVerifyVendor();
  const rejectVendor = useRejectVendorVerification();
  const deleteVendor = useSoftDeleteVendor();
  const recoverVendor = useRecoverVendor();
  const isSubmitting =
    verifyVendor.isPending ||
    rejectVendor.isPending ||
    deleteVendor.isPending ||
    recoverVendor.isPending;

  const handleSubmit = async () => {
    if (!vendor) return;
    setError(null);
    setSuccess(null);
    if ((action === 'reject' || action === 'delete') && reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }

    try {
      const result =
        action === 'verify'
          ? await verifyVendor.mutateAsync({ vendorId: vendor.id })
          : action === 'reject'
            ? await rejectVendor.mutateAsync({ vendorId: vendor.id, reason: reason.trim() })
            : action === 'delete'
              ? await deleteVendor.mutateAsync({ vendorId: vendor.id, reason: reason.trim() })
              : await recoverVendor.mutateAsync({ vendorId: vendor.id });
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to update this vendor.',
      );
    }
  };

  return (
    <FormDialog
      title={vendor ? `Manage ${vendor.title}` : 'Manage vendor'}
      open={Boolean(vendor)}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel="Apply"
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

      {action === 'reject' || action === 'delete' ? (
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
    </FormDialog>
  );
}
