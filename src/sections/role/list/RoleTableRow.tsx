import { useState } from 'react';
// @mui
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  MenuItem,
  Modal,
  TableCell,
  TableRow,
} from '@mui/material';
// @types
import { useNavigate } from 'react-router-dom';
import { IRole, IRoleCreate } from '../../../types/role';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import ConfirmDialog from '../../../components/custom-dialog/confirm-dialog';
import RoleNewEditForm from '../RoleNewEditForm';
import Label from '../../../components/label';
import { IPermission } from '../../../types/permission';
import { paths } from '../../../routes/paths';

// ----------------------------------------------------------------------

type Props = {
  row: IRole;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

const idsFromPermissionList = (list: IPermission[]) => {
  const listNumber: number[] = [];
  list.forEach((item: IPermission) => {
    if (item.id) listNumber.push(item.id);
  });
  return listNumber;
};

export default function RoleTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const { id, displayName, permissions } = row;

  const rowForCreate: IRoleCreate = { ...row, permissions: idsFromPermissionList(permissions) };

  const [openConfirm, setOpenConfirm] = useState(false);

  const [open, setOpen] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const navigate = useNavigate();

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

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditRow = () => {
    navigate(paths.dashboard.role.edit(id));
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {displayName}
        </TableCell>

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
          sx={{ color: 'error.dark' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Remover
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleEditRow();
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
          <RoleNewEditForm currentRole={rowForCreate} isEdit />
        </Box>
      </Modal>
    </>
  );
}
