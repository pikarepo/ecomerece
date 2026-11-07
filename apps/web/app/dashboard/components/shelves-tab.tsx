import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomeContainerResponse } from '@ecomerece/shared';

export function ShelvesTab({ containers }: { containers: HomeContainerResponse[] }) {
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
          </TableRow>
        </TableHead>
        <TableBody>
          {ordered.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.displayOrder}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{row.heading}</TableCell>
              <TableCell>{row.subTitle}</TableCell>
              <TableCell>{row.query.limit ?? 20}</TableCell>
              <TableCell>{row.query.direction ?? 'next'}</TableCell>
              <TableCell sx={{ maxWidth: 260, wordBreak: 'break-all' }}>
                {row.query.filter ? JSON.stringify(row.query.filter) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
