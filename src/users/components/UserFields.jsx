import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { ALL_ROLES } from '../userDisplay';

/**
 * The user's data fields (prototype: UsersDesktop "Datos" card), shared by
 * the create sheet and the detail page. `email` is shown read-only when
 * editing (it is the Google login identity); `lockAdmin` keeps the ADMIN
 * role checked for the permanent admin.
 */
export default function UserFields({ register, control, errors, disabled = false, email, lockAdmin = false }) {
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
        <TextField
          label="Apellido paterno"
          required
          disabled={disabled}
          {...register('lastNamePat')}
          error={Boolean(errors.lastNamePat)}
          helperText={errors.lastNamePat?.message}
        />
        <TextField
          label="Apellido materno"
          disabled={disabled}
          {...register('lastNameMat')}
          error={Boolean(errors.lastNameMat)}
          helperText={errors.lastNameMat?.message}
        />
        <TextField
          label="Nombres"
          required
          disabled={disabled}
          {...register('firstName')}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName?.message}
        />
        {email === undefined ? (
          <TextField
            label="Correo"
            type="email"
            required
            disabled={disabled}
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
        ) : (
          <TextField label="Correo (no editable)" value={email} disabled slotProps={{ htmlInput: { readOnly: true } }} />
        )}
      </Box>

      <Controller
        name="roles"
        control={control}
        render={({ field }) => (
          <FormControl component="fieldset" error={Boolean(errors.roles)} disabled={disabled}>
            <FormLabel component="legend" sx={{ fontSize: 12 }}>
              Roles (al menos uno)
            </FormLabel>
            <FormGroup>
              {ALL_ROLES.map((role) => (
                <FormControlLabel
                  key={role}
                  label={role}
                  control={
                    <Checkbox
                      checked={field.value.includes(role)}
                      disabled={disabled || (lockAdmin && role === 'ADMIN')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.checked
                            ? ALL_ROLES.filter((r) => r === role || field.value.includes(r))
                            : field.value.filter((r) => r !== role),
                        )
                      }
                    />
                  }
                />
              ))}
            </FormGroup>
            {lockAdmin && <FormHelperText>El administrador permanente siempre conserva el rol ADMIN.</FormHelperText>}
            {errors.roles && <FormHelperText>{errors.roles.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </>
  );
}
