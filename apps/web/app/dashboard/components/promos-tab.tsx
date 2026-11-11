import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomePromoResponse } from '@ecomerece/shared';
import { HomeRowActions } from './home-row-actions';

export function PromosTab({
  promos,
  onEdit,
  onDelete,
}: {
  promos: HomePromoResponse[];
  onEdit: (promo: HomePromoResponse) => void;
  onDelete: (promo: HomePromoResponse) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Subtitle</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Accent</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {promos.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
              <TableCell>{row.subtitle}</TableCell>
              <TableCell sx={{ maxWidth: 260, wordBreak: 'break-all' }}>{row.link}</TableCell>
              <TableCell>{row.accent}</TableCell>
              <TableCell align="right">
                <HomeRowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
