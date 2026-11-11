import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { InventoryResponseReadModel } from '@ecomerece/shared';
import { formatDateTime, formatNumber } from '../../../../components/format';

export function InventoryTable({
  inventory,
  onManage,
}: {
  inventory: InventoryResponseReadModel[];
  onManage: (item: InventoryResponseReadModel) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Variant</TableCell>
            <TableCell align="right">Available</TableCell>
            <TableCell align="right">Reserved</TableCell>
            <TableCell align="right">Low stock at</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.map((item) => {
            const isLow = item.available <= item.lowStockThreshold;
            return (
              <TableRow key={item.id} hover>
                <TableCell>{item.variantId}</TableCell>
                <TableCell align="right">{formatNumber(item.available)}</TableCell>
                <TableCell align="right">{formatNumber(item.reserved)}</TableCell>
                <TableCell align="right">{formatNumber(item.lowStockThreshold)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={isLow ? 'Low stock' : 'Healthy'}
                    color={isLow ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => onManage(item)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
