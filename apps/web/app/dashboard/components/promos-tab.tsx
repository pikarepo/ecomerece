import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomePromoResponse } from '@ecomerece/shared';

export function PromosTab({ promos }: { promos: HomePromoResponse[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Subtitle</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Accent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {promos.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
              <TableCell>{row.subtitle}</TableCell>
              <TableCell sx={{ maxWidth: 260, wordBreak: 'break-all' }}>{row.link}</TableCell>
              <TableCell>{row.accent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
