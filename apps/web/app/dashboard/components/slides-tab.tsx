import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomeSlideResponse } from '@ecomerece/shared';
import { HomeRowActions } from './home-row-actions';

export function SlidesTab({
  slides,
  onEdit,
  onDelete,
  onMove,
}: {
  slides: HomeSlideResponse[];
  onEdit: (slide: HomeSlideResponse) => void;
  onDelete: (slide: HomeSlideResponse) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const ordered = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Tag</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>CTA</TableCell>
            <TableCell>Accent</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordered.map((row, index) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.displayOrder}</TableCell>
              <TableCell>{row.tag}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
              <TableCell>{row.cta}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: row.accent,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  {row.accent}
                </Stack>
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
