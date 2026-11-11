import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import { formatDateTime, formatMoney } from '../../../../components/format';

export function VariantTable({
  variants,
  onManage,
}: {
  variants: ProductVariantResponseReadModel[];
  onManage: (variant: ProductVariantResponseReadModel) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Variant</TableCell>
            <TableCell>Product</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Discounted</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id} hover>
              <TableCell>{variant.title}</TableCell>
              <TableCell>{variant.productId}</TableCell>
              <TableCell align="right">{formatMoney(variant.price)}</TableCell>
              <TableCell align="right">{formatMoney(variant.discountedPrice)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={variant.active ? 'Active' : 'Inactive'}
                  color={variant.active ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{formatDateTime(variant.createdAt)}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onManage(variant)}>
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
