import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomeContainerResponse } from '@ecomerece/shared';
import { HomeRowActions } from './home-row-actions';

export function ShelvesTab({
  containers,
  onEdit,
  onDelete,
  onMove,
}: {
  containers: HomeContainerResponse[];
  onEdit: (container: HomeContainerResponse) => void;
  onDelete: (container: HomeContainerResponse) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const ordered = [...containers].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Heading</TableCell>
            <TableCell>Subtitle</TableCell>
            <TableCell>Limit</TableCell>
            <TableCell>Direction</TableCell>
            <TableCell>Filter</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordered.map((row, index) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.displayOrder}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{row.heading}</TableCell>
              <TableCell>{row.subTitle}</TableCell>
              <TableCell>{row.query.limit ?? 20}</TableCell>
              <TableCell>{row.query.direction ?? 'next'}</TableCell>
              <TableCell sx={{ maxWidth: 260, wordBreak: 'break-all' }}>
                {row.query.filter ? JSON.stringify(row.query.filter) : '—'}
              </TableCell>
              <TableCell align="right">
                <HomeRowActions
                  onEdit={() => onEdit(row)}
                  onDelete={() => onDelete(row)}
                  onMoveUp={() => onMove(index, -1)}
                  onMoveDown={() => onMove(index, 1)}
                  disableUp={index === 0}
                  disableDown={index === ordered.length - 1}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
