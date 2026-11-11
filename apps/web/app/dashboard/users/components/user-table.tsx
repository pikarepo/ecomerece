import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { UserResponseReadModel } from '@ecomerece/shared';
import { formatDateTime } from '../../../../components/format';

export function UserTable({
  users,
  onManage,
}: {
  users: UserResponseReadModel[];
  onManage: (user: UserResponseReadModel) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last login</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar
                    src={user.image ?? undefined}
                    alt={user.fullName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user.fullName.slice(0, 1)}
                  </Avatar>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email ?? 'No email'}
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip size="small" label={user.role} variant="outlined" />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {user.isBlocked ? <Chip size="small" label="Blocked" color="warning" /> : null}
                  {user.isBanned ? <Chip size="small" label="Banned" color="error" /> : null}
                  {user.isDeleted ? <Chip size="small" label="Deleted" color="error" /> : null}
                  {!user.isBlocked && !user.isBanned && !user.isDeleted ? (
                    <Chip size="small" label="Active" color="success" />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
              <TableCell>{formatDateTime(user.createdAt)}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onManage(user)}>
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
