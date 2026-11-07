import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { HomeSlideResponse } from '@ecomerece/shared';

export function SlidesTab({ slides }: { slides: HomeSlideResponse[] }) {
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
          </TableRow>
        </TableHead>
        <TableBody>
          {ordered.map((row) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
