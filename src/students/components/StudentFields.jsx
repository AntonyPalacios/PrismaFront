import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

/**
 * The student's personal data, shared by "Nuevo alumno" and the "Datos"
 * card of the detail (read-only there until "Editar"). Only names and
 * paternal surname are required.
 */
export default function StudentFields({ register, errors, disabled = false, autoFocus = false }) {
  const field = (name, props) => ({
    ...register(name),
    disabled,
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
    ...props,
  });
  const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.75 };

  return (
    <>
      <TextField label="Nombres" required autoFocus={autoFocus} {...field('firstName')} />
      <Box sx={twoColumns}>
        <TextField label="Apellido paterno" required {...field('lastNamePat')} />
        <TextField label="Apellido materno" {...field('lastNameMat')} />
      </Box>
      <Box sx={twoColumns}>
        <TextField label="DNI" {...field('dni', { slotProps: { htmlInput: { inputMode: 'text', maxLength: 12 } } })} />
        <TextField
          label="Fecha de nacimiento"
          type="date"
          // a date input always shows its dd/mm/aaaa hint: keep the label above it
          {...field('birthDate', { slotProps: { inputLabel: { shrink: true } } })}
        />
      </Box>
      <Box sx={twoColumns}>
        <TextField label="Correo" type="email" {...field('email')} />
        <TextField label="Teléfono" type="tel" {...field('phone')} />
      </Box>
    </>
  );
}
