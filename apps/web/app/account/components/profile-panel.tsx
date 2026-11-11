import BadgeIcon from '@mui/icons-material/Badge';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { UserResponseReadModel } from '@ecomerece/shared';
import { formatDateTime } from '../../../components/format';

export function ProfilePanel({ user }: { user: UserResponseReadModel }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        sx={{ alignItems: 'flex-start' }}
      >
        <Avatar src={user.image ?? undefined} alt={user.fullName} sx={{ width: 72, height: 72 }}>
          {user.fullName.slice(0, 1)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
            {user.fullName}
          </Typography>
          <Typography color="text.secondary">{user.email ?? 'No email on file'}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            <Chip icon={<BadgeIcon />} label={user.role} color="primary" variant="outlined" />
            <Chip
              label={user.isBlocked ? 'Blocked' : 'Active'}
              color={user.isBlocked ? 'warning' : 'success'}
              variant="outlined"
            />
            {user.isBanned ? <Chip label="Banned" color="error" variant="outlined" /> : null}
            {user.isDeleted ? <Chip label="Deleted" color="error" variant="outlined" /> : null}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 2.5,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last login
              </Typography>
              <Typography variant="body2">{formatDateTime(user.lastLogin)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Member since
              </Typography>
              <Typography variant="body2">{formatDateTime(user.createdAt)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Banned until
              </Typography>
              <Typography variant="body2">{formatDateTime(user.bannedUntil)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user.id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
