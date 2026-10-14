import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
// redux
import { generateAndDownloadFile } from 'src/redux/services/fileDownloadService';
import { getApiErrorMessage } from 'src/utils/axios';

// ----------------------------------------------------------------------

type Props = {
  /** Caminho depois de /reports/export (ex.: "entries", "statement/12"). */
  context: string;
  fileName: string;
  /** Os mesmos filtros da listagem, para a exportacao coincidir com o que se ve. */
  params: Record<string, string | number | undefined>;
  formats?: ('EXCEL' | 'PDF')[];
};

export default function ExportButton({
  context,
  fileName,
  params,
  formats = ['EXCEL', 'PDF'],
}: Props) {
  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const download = async (fileFormat: 'EXCEL' | 'PDF') => {
    popover.onClose();
    setLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      );
      await generateAndDownloadFile(context, {
        ...clean,
        fileFormat,
        defaultFileName: `${fileName}.${fileFormat === 'PDF' ? 'pdf' : 'xlsx'}`,
      });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível exportar.'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        disabled={loading}
        onClick={popover.onOpen}
        startIcon={<Iconify icon="solar:export-bold-duotone" />}
      >
        Exportar
      </Button>
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
        {formats.map((format) => (
          <MenuItem key={format} onClick={() => download(format)}>
            <Iconify
              icon={
                format === 'PDF' ? 'solar:file-text-bold-duotone' : 'solar:document-bold-duotone'
              }
            />
            {format === 'PDF' ? 'PDF' : 'Excel'}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
