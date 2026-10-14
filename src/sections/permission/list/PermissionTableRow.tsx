import { useState } from 'react';
// @mui
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  MenuItem,
  Modal,
  TableCell,
  TableRow,
} from '@mui/material';
// @types
import { IPermission } from '../../../types/permission';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import ConfirmDialog from '../../../components/custom-dialog/confirm-dialog';
import PermissionNewEditForm from '../PermissionNewEditForm';
import Label from '../../../components/label';

// ----------------------------------------------------------------------

type Props = {
  row: IPermission;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function PermissionTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const { name, displayName, contextPath, bundler } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [open, setOpen] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="left">{name}</TableCell>

        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {displayName}
        </TableCell>
        <TableCell align="left">{contextPath}</TableCell>
        <TableCell align="left">{bundler}</TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Remover
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpen();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Editar
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Remover"
        content="Tem certeza que deseja remover?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenConfirm(false);
              onDeleteRow();
            }}
          >
            Remover
          </Button>
        }
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style }}>
          <Label>Actualizar permissão</Label>
          <PermissionNewEditForm currentPermission={row} isEdit closeModal={handleClose} />
        </Box>
      </Modal>
    </>
  );
}
