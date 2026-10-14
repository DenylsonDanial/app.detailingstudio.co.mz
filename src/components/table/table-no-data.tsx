// @mui
import { Theme, SxProps } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
//
import { Box } from '@mui/material';
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
  helperTxt?: string;
};

export default function TableNoData({ notFound, sx, helperTxt }: Props) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={helperTxt || 'Sem resultados por apresentar'}
            sx={{
              py: 10,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
