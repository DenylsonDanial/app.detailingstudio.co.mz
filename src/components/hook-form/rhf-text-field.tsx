import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  snakeCase?: boolean
};

export default function RHFTextField({ name, snakeCase, helperText, type, inputProps = {}, ...other }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    fullWidth
                    type={type}
                    value={type === 'number' && field.value === 0 ? '' : field.value}
                    onChange={(event) => {
                        const { value } = event.target;
                        const maxLength = inputProps?.maxLength;

                        if (maxLength && value.length > maxLength) {
                            return; // Prevent input if maxLength is exceeded
                        }

                        if (type === 'number') {
                            // Only allow numeric values and respect maxLength
                            const re = /^[0-9\b]+$/;
                            if (value === '' || (re.test(value) && (!maxLength || value.length <= maxLength))) {
                                field.onChange(value);
                            }
                        } else if(snakeCase) {
                            const formattedValue = event.target.value.toLowerCase().replace(/\s+/g, '_');
                            field.onChange(formattedValue)
                        } else {
                            field.onChange(value);
                        }
                    }}
                    error={!!error}
                    helperText={error ? error?.message : helperText}
                    inputProps={{
                        ...inputProps, // Pass through custom input props
                        maxLength: inputProps.maxLength, // Apply maxLength for text fields
                    }}
                    {...other}
                />
            )}
        />
    );
}

