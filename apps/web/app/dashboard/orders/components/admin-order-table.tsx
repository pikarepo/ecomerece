import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { OrderListItem } from '@ecomerece/frontend/order';
import { formatDateTime, formatMoney } from '../../../../components/format';

export function AdminOrderTable({ orders }: { orders: OrderListItem[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>#{order.id.slice(0, 8)}</TableCell>
              <TableCell>{order.buyerId}</TableCell>
              <TableCell>{order.address}</TableCell>
              <TableCell>{formatMoney(order.totalPrice)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={order.deleted.deleted ? 'Deleted' : 'Active'}
                  color={order.deleted.deleted ? 'error' : 'success'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{formatDateTime(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
