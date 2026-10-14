import {useState} from 'react';
// @mui
import {Button, IconButton, TableCell, TableRow,} from '@mui/material';
// @types
import {ITenant} from '../../../types/tenant';
// components
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/custom-dialog/confirm-dialog';
import Label from "../../../components/label";

// ----------------------------------------------------------------------

type Props = {
  row: ITenant;
  selected: boolean;
  onSelectRow: VoidFunction;
  onActivate: VoidFunction;
  onDeactivate: VoidFunction;
};

export default function TenantTableRow({
  row,
  selected,
  onSelectRow,
  onActivate,
    onDeactivate
}: Props) {
  const { id, tenantId, tenantName, active } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };


  return (
    <>
      <TableRow hover selected={selected}>

        <TableCell align="left">{tenantName}</TableCell>

        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {tenantId}
        </TableCell>
          <TableCell align="left">
              <Label
                  variant="soft"
                  color={
                      (active && 'success') ||
                      (!active && 'warning') ||
                      'default'
                  }
              >
                  {active ? 'Activa' : 'Inactiva'}
              </Label>
          </TableCell>

        <TableCell align="right">
            {active && <IconButton color='success' onClick={handleOpenConfirm}>
              <Iconify icon="eva:power-outline" />
          </IconButton>}
            {!active && <IconButton onClick={handleOpenConfirm}>
              <Iconify icon="eva:power-outline" />
          </IconButton>}
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title={active ? "Desactivar" : "Activar"}
        content={active ? "Tem certeza que deseja Desactivar?" : "Tem certeza que deseja Activar?"}
        action={
          <Button variant="contained" color={active ? 'error' : 'success'} onClick={() => {
              setOpenConfirm(false)
              active ? onDeactivate() : onActivate()
            }
          }>
            Sim, Tenho certeza.
          </Button>
        }
      />
    </>
  );
}
