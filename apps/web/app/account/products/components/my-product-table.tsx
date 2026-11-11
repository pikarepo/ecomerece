'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ProductAdminResponseReadModel } from '@ecomerece/shared';
import Link from 'next/link';
import { formatMoney } from '../../../../components/format';

export function MyProductTable({
  products,
  onManage,
}: {
  products: ProductAdminResponseReadModel[];
  onManage: (product: ProductAdminResponseReadModel) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Price range</TableCell>
            <TableCell>State</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={product.image.images[0]?.url}
                    alt={product.title}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      objectFit: 'cover',
                      bgcolor: 'grey.100',
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {product.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.categoryId}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={product.appearance}
                  color={product.appearance === 'public' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {formatMoney(product.minPrice)} – {formatMoney(product.maxPrice)}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {product.isDeleted ? <Chip size="small" label="Deleted" color="error" /> : null}
                  {product.isBlocked ? <Chip size="small" label="Blocked" color="warning" /> : null}
                  {!product.isDeleted && !product.isBlocked ? (
                    <Chip size="small" label="Active" color="success" />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  component={Link}
                  href={`/products/${product.id}`}
                  startIcon={<VisibilityIcon />}
                >
                  View
                </Button>
                <Button size="small" onClick={() => onManage(product)}>
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
