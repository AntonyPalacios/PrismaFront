import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useLinkParentMutation, useSearchParentsQuery, useUpdateParentMutation } from '../api/parentsApi';
import { RELATIONSHIPS, contactSchema, toContact } from './parentSchema';

const fieldProps = { size: 'small', fullWidth: true, slotProps: { inputLabel: { shrink: true } } };

// linking: the relationship always; the contact data only when registering a new guardian
const linkSchema = z
  .object({
    registering: z.boolean(),
    relationshipType: z.string().min(1, 'Elige el parentesco'),
    fullName: z.string(),
    phone: z.string(),
    email: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.registering) return;
    const contact = contactSchema.safeParse(values);
    if (!contact.success) contact.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

/**
 * A guardian of the student (REQ-STUDENTS-03), bottom sheet on mobile and
 * dialog on desktop. Without {@code parent}: "Vincular apoderado", which
 * looks for a registered guardian (a sibling's) by name or phone, or
 * registers a new one, with the relationship, in one "Guardar". With it:
 * edit their contact data, which changes for every student they look after.
 */
export default function ParentForm({ student, parent, onClose }) {
  return parent ? <EditParent parent={parent} onClose={onClose} /> : <LinkParent student={student} onClose={onClose} />;
}

function LinkParent({ student, onClose }) {
  const notify = useNotify();
  const [search, setSearch] = useState('');
  const [chosen, setChosen] = useState(null);
  const [missingParent, setMissingParent] = useState(false);
  const [serverError, setServerError] = useState(null);
  // mirrored in the form values, where the schema reads it
  const [registering, setRegistering] = useState(false);
  const typed = search.trim();
  const { currentData: found = [], isFetching } = useSearchParentsQuery(typed, { skip: typed.length < 2 });
  const [linkParent] = useLinkParentMutation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: { registering: false, relationshipType: '', fullName: '', phone: '', email: '' },
  });
  const toggleRegistering = (value) => {
    setRegistering(value);
    setValue('registering', value);
  };

  const onSubmit = async (values) => {
    if (!values.registering && !chosen) {
      setMissingParent(true);
      return;
    }
    setServerError(null);
    try {
      await linkParent({
        studentId: student.id,
        relationshipType: values.relationshipType,
        ...(values.registering ? { parent: toContact(values) } : { parentId: chosen.id }),
      }).unwrap();
      notify('Apoderado vinculado.');
      onClose();
    } catch (err) {
      setServerError(errorDetail(err));
    }
  };

  return (
    <ResponsiveSheet onClose={onClose}>
      <Box
        component="form"
        aria-label="Vincular apoderado"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
      >
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>
          Vincular apoderado
        </Typography>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        {!registering && (
          <>
            <Autocomplete
              options={found}
              value={chosen}
              inputValue={search}
              // MUI "resets" the text to nothing when the results arrive with nobody chosen: keep what was typed
              onInputChange={(_, text, reason) => {
                if (reason === 'reset' && text === '' && !chosen) return;
                setSearch(text);
              }}
              onChange={(_, value) => {
                setChosen(value);
                setMissingParent(false);
              }}
              filterOptions={(options) => options}
              loading={isFetching}
              getOptionLabel={(option) => `${option.fullName} · ${option.phone}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={typed.length < 2 ? 'Escribe al menos 2 letras o números.' : 'No hay apoderados registrados que coincidan.'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Apoderado registrado"
                  placeholder="Busca por nombre o celular"
                  error={missingParent}
                  helperText={missingParent ? 'Elige un apoderado o registra uno nuevo' : 'Por ejemplo, el de un hermano'}
                  slotProps={{ ...params.slotProps, inputLabel: { shrink: true } }}
                />
              )}
            />
            <Button
              onClick={() => toggleRegistering(true)}
              sx={{ alignSelf: 'flex-start', color: colors.secondary, px: 0 }}
            >
              + Registrar nuevo apoderado
            </Button>
          </>
        )}

        {registering && (
          <>
            <ContactFields register={register} errors={errors} />
            <Button onClick={() => toggleRegistering(false)} sx={{ alignSelf: 'flex-start', color: colors.secondary, px: 0 }}>
              Buscar un apoderado registrado
            </Button>
          </>
        )}

        <TextField
          {...fieldProps}
          select
          label="Parentesco"
          {...register('relationshipType')}
          defaultValue=""
          error={Boolean(errors.relationshipType)}
          helperText={errors.relationshipType?.message}
          slotProps={{ ...fieldProps.slotProps, select: { native: true } }}
        >
          <option value="">Elige una opción</option>
          {RELATIONSHIPS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </TextField>

        <FormActions onClose={onClose} submitting={isSubmitting} />
      </Box>
    </ResponsiveSheet>
  );
}

function EditParent({ parent, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [updateParent] = useUpdateParentMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: parent.fullName, phone: parent.phone, email: parent.email ?? '' },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateParent({ id: parent.parentId, ...toContact(values) }).unwrap();
      notify('Apoderado actualizado.');
      onClose();
    } catch (err) {
      setServerError(errorDetail(err));
    }
  };

  return (
    <ResponsiveSheet onClose={onClose}>
      <Box
        component="form"
        aria-label="Editar apoderado"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
      >
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>
          Editar apoderado
        </Typography>
        {parent.otherStudents.length > 0 && (
          <Alert severity="info">
            {`También es apoderado de ${parent.otherStudents.join('; ')}. El cambio se verá también en ${
              parent.otherStudents.length === 1 ? 'su ficha' : 'sus fichas'
            }.`}
          </Alert>
        )}
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <ContactFields register={register} errors={errors} />
        <FormActions onClose={onClose} submitting={isSubmitting} />
      </Box>
    </ResponsiveSheet>
  );
}

function ContactFields({ register, errors }) {
  return (
    <>
      <TextField
        {...fieldProps}
        label="Nombre completo"
        {...register('fullName')}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          {...fieldProps}
          label="Celular"
          inputMode="tel"
          {...register('phone')}
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
        />
        <TextField
          {...fieldProps}
          label="Correo (opcional)"
          type="email"
          {...register('email')}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
      </Box>
    </>
  );
}

function FormActions({ onClose, submitting }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
      <Button variant="outlined" onClick={onClose} disabled={submitting} sx={{ minWidth: 120, height: 44 }}>
        Cancelar
      </Button>
      <Button type="submit" variant="contained" color="secondary" disabled={submitting} sx={{ minWidth: 120, height: 44 }}>
        Guardar
      </Button>
    </Box>
  );
}
