import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  label: string;
  onClick: VoidFunction;
  icon?: string;
  variant?: 'contained' | 'soft';
  color?: 'primary' | 'secondary';
};

/**
 * Accao principal da barra superior: texto a partir de sm, so icone (44x44,
 * com nome acessivel) em ecras estreitos para nao colidir com o titulo.
 */
export default function HeaderPrimaryAction({
  label,
  onClick,
  icon = 'eva:plus-fill',
  variant = 'contained',
  color = 'primary',
}: Props) {
  return (
    <Button
      variant={variant}
      color={color}
      startIcon={<Iconify icon={icon} />}
      onClick={onClick}
      aria-label={label}
      title={label}
      sx={{
        flexShrink: 0,
        minWidth: { xs: 44, sm: 'auto' },
        width: { xs: 44, sm: 'auto' },
        height: 44,
        px: { xs: 0, sm: 2 },
        '& .MuiButton-startIcon': { m: { xs: 0, sm: '0 8px 0 -4px' } },
      }}
    >
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {label}
      </Box>
    </Button>
  );
}
