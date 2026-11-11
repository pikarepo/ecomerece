import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AddressResponseReadModel } from '@ecomerece/shared';

export function AddressCard({
  address,
  isBusy,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: AddressResponseReadModel;
  isBusy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const isDefault = Boolean(address.defaultDate);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isDefault ? 'primary.main' : 'divider',
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <HomeIcon color={isDefault ? 'primary' : 'action'} />
        <Typography sx={{ fontWeight: 700, flex: 1 }}>
          {address.city}, {address.country}
        </Typography>
        {isDefault ? <Chip size="small" label="Default" color="primary" /> : null}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {address.fullAddress || address.streetAddress}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {address.streetAddress}, {address.state} {address.postalCode}, {address.country}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
        {!isDefault ? (
          <Button size="small" variant="outlined" onClick={onSetDefault} disabled={isBusy}>
            Set default
          </Button>
        ) : null}
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit} disabled={isBusy}>
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          disabled={isBusy}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
}
