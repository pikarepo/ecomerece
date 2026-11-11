import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { AggregateTimeSeriesPoint } from '@ecomerece/frontend/stats';
import { formatMoney, formatNumber } from '../../../../components/format';

export function SeriesTable({ series }: { series: AggregateTimeSeriesPoint[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell align="right">Views</TableCell>
            <TableCell align="right">Purchases</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Revenue</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {series.map((point) => (
            <TableRow key={point.key} hover>
              <TableCell>{point.key}</TableCell>
              <TableCell align="right">{formatNumber(point.metrics.views ?? 0)}</TableCell>
              <TableCell align="right">{formatNumber(point.metrics.purchases ?? 0)}</TableCell>
              <TableCell align="right">{formatNumber(point.metrics.quantity ?? 0)}</TableCell>
              <TableCell align="right">{formatMoney(point.metrics.revenue ?? 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
