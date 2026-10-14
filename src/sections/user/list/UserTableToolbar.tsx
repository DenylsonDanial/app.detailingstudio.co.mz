// @mui
import { Stack, TextField, MenuItem, Button } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { IRole } from '../../../types/role';

// ----------------------------------------------------------------------

type Props = {
  filterRole: string;
  isFiltered: boolean;
  optionsRole: IRole[];
  onResetFilter: VoidFunction;
  onFilterRole: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function UserTableToolbar({
  isFiltered,
  filterRole,
  optionsRole,
  onFilterRole,
  onResetFilter,
}: Props) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: 2.5, py: 2 }}
    >
      <TextField
        select
        label="Cargo"
        size="small"
        value={filterRole}
        onChange={onFilterRole}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 260,
              },
            },
          },
        }}
        sx={{
          width: { xs: 1, sm: 240 },
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          key="Todos"
          value="Todos"
          sx={{
            mx: 1,
            borderRadius: 0.75,
            typography: 'body2',
            textTransform: 'capitalize',
          }}
        >
          Todos
        </MenuItem>
        {optionsRole.map((option) => (
          <MenuItem
            key={option.id}
            value={option.name}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
            }}
          >
            {option.displayName}
          </MenuItem>
        ))}
      </TextField>

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Limpar
        </Button>
      )}
    </Stack>
  );
}
