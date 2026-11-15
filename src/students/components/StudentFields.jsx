import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

/**
 * The student's personal data, shared by "Nuevo alumno" and the "Datos"
 * card of the detail (read-only there until "Editar"). Only names and
 * paternal surname are required.
 *
 * `compact` (the detail's "Datos" card) packs every field in two columns,
 * also on a phone, with smaller fields, so the file does not become a long
 * column of inputs; the email takes the whole row, since it would be cut.
 */
export default function StudentFields({ register, errors, disabled = false, autoFocus = false, compact = false }) {
  const field = (name, props) => ({
    ...register(name),
    disabled,
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
    ...(compact ? { size: 'small' } : {}),
    ...props,
  });
  const dniProps = { slotProps: { htmlInput: { inputMode: 'text', maxLength: 12 } } };
  // a date input always shows its dd/mm/aaaa hint: keep the label above it
  const birthDateProps = { slotProps: { inputLabel: { shrink: true } } };

  if (compact) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
        <TextField label="Nombres" required autoFocus={autoFocus} {...field('firstName')} />
        <TextField label="Apellido paterno" required {...field('lastNamePat')} />
        <TextField label="Apellido materno" {...field('lastNameMat')} />
        <TextField label="DNI" {...field('dni', dniProps)} />
        <TextField label="Fecha de nacimiento" type="date" {...field('birthDate', birthDateProps)} />
        <TextField label="Teléfono" type="tel" {...field('phone')} />
        <TextField label="Correo" type="email" {...field('email')} sx={{ gridColumn: '1 / -1' }} />
      </Box>
    );
  }

  const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.75 };
  return (
    <>
      <TextField label="Nombres" required autoFocus={autoFocus} {...field('firstName')} />
      <Box sx={twoColumns}>
        <TextField label="Apellido paterno" required {...field('lastNamePat')} />
        <TextField label="Apellido materno" {...field('lastNameMat')} />
      </Box>
      <Box sx={twoColumns}>
        <TextField label="DNI" {...field('dni', dniProps)} />
        <TextField label="Fecha de nacimiento" type="date" {...field('birthDate', birthDateProps)} />
      </Box>
      <Box sx={twoColumns}>
        <TextField label="Correo" type="email" {...field('email')} />
        <TextField label="Teléfono" type="tel" {...field('phone')} />
      </Box>
    </>
  );
}
