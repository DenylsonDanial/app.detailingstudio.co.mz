import { useState } from 'react';
// @mui
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// redux
import { useGetClientsQuery } from 'src/redux/services/clientService';
// types
import { IClient } from 'src/types/detailing';
import { formatMzn } from 'src/utils/maputo-time';

// ----------------------------------------------------------------------

type Props = {
  value: IClient | null;
  onChange: (client: IClient | null) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
};

/** Pesquisa de clientes activos por nome, contacto ou matricula. */
export default function ClientAutocomplete({
  value,
  onChange,
  label = 'Cliente (nome, contacto ou matrícula)',
  disabled,
  size,
  error,
  helperText,
}: Props) {
  const [input, setInput] = useState('');
  const term = useDebounce(input, 300);

  const { currentData, isFetching } = useGetClientsQuery({
    page: 0,
    size: 20,
    status: 'ACTIVE',
    term,
    sort: 'name',
  });

  const options = currentData?.content ?? [];

  return (
    <Autocomplete
      value={value}
      options={
        value && !options.some((item) => item.id === value.id) ? [value, ...options] : options
      }
      loading={isFetching}
      disabled={disabled}
      size={size}
      filterOptions={(items) => items}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onChange={(_event, selected) => onChange(selected)}
      onInputChange={(_event, text, reason) => {
        if (reason === 'input') setInput(text);
        if (reason === 'clear') setInput('');
      }}
      noOptionsText="Nenhum cliente encontrado"
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack sx={{ width: 1 }}>
            <Typography variant="body2">{option.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {[option.phone, option.vehicles.map((vehicle) => vehicle.plate).join(', ')]
                .filter(Boolean)
                .join(' · ') || 'Sem contacto nem viaturas'}
              {option.currentDebt ? ` · Dívida ${formatMzn(option.currentDebt)}` : ''}
            </Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} />
      )}
    />
  );
}
