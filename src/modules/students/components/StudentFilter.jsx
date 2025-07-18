import {useEffect} from "react";
import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {stages, studentStates} from "../../../assets/fakeData.jsx";
import {useGetAreasQuery} from "../../../store/slices/api/apiSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {Controller, useForm} from "react-hook-form";
import {setFilter} from "../../../store/slices/student/studentSlice.js";
import MenuItem from "@mui/material/MenuItem";

const defaultFormValues = {
    stageId:1,
    areaId:-1, //todas las areas
    tutorId:-1, // todos los tutores
    isActive: 1, // activos
    name:''
}

export const StudentFilter = () => {

    const {control, watch, setValue} = useForm({defaultValues:defaultFormValues});

    const {data:areas} = useGetAreasQuery();
    const {tutorList} = useSelector((state) => state.user);
    const {user, roles} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const isCurrentUserTutor = roles.includes('ROLE_TUTOR');
    const isCurrentUserAdmin = roles.includes('ROLE_ADMIN');

    useEffect(() => {
        // Solo si el usuario actual es un tutor y su ID está disponible
        // y si el filtro de tutorId no ha sido ya establecido (ej. por el usuario manualmente)
        if (isCurrentUserTutor && user && user.id && watch('tutorId') === -1) {
            // Busca si el ID del usuario logueado existe en la lista de tutores disponibles
            const tutorExistsInList = tutorList.some(tutor => tutor.id === user.id);
            if (tutorExistsInList) {
                setValue('tutorId', user.id, { shouldDirty: true }); // Establece el valor del tutorId
                // Opcional: Si quieres que el filtro se aplique inmediatamente, despacha el filtro
                const updatedFormValues = { ...watch(), tutorId: user.id };
                dispatch(setFilter(updatedFormValues));
            }
        }
    }, [user, tutorList, setValue, watch, dispatch, isCurrentUserTutor]);

    // *** CAMBIO CLAVE AQUÍ: Usar la suscripción de watch ***
    useEffect(() => {
        // Suscribirse a los cambios de todos los campos del formulario
        const subscription = watch((value) => {
            dispatch(setFilter(value));
        });

        // Retorna una función de limpieza para cancelar la suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe();
    }, [watch, dispatch]); // Las dependencias son watch y dispatch (ambas son estables)


    return (
        <Grid container spacing={2} width="100%">
            <Grid size={{xs: 6, md: 2, xl: 2}}>
                <Controller
                    name="stageId"
                    control={control}
                    render={({ field }) => (
                        <MySelect
                            {...field}
                            options={stages}
                            label="Etapa"
                            defaultItem="Todas las etapas"
                        />
                    )}
                />

            </Grid>
            <Grid size={{xs: 6, md: 2}}>
                <Controller
                    name="areaId"
                    control={control}
                    render={({ field }) => (
                        <MySelect
                            {...field}
                            options={areas}
                            label="Área"
                            defaultItem="Todas las áreas"
                        >
                            <MenuItem value={0}>
                                Sin Área
                            </MenuItem>
                        </MySelect>
                    )}

                />

            </Grid>
            <Grid size={{xs: 6, md: 2}}>
                <Controller
                    name="tutorId"
                    control={control}
                    render={({ field }) => (
                        <MySelect
                            {...field}
                            options={tutorList}
                            label="Tutor"
                            defaultItem="Todos los tutores"
                            disabled={!isCurrentUserAdmin}
                        >
                            <MenuItem value={0}>
                                Sin Tutor
                            </MenuItem>
                        </MySelect>
                    )}
                />
            </Grid>
            <Grid size={{xs: 6, md: 2}}>
                <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                        <MySelect
                            {...field}
                            options={studentStates}
                            label="Estado"
                            defaultItem="Todos los estados"
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 12, md: 4}} sx={{display: 'flex', gap: 1, justifyContent: 'space-between'}}>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <MyInput
                            {...field}
                            label="Nombre"
                        />
                    )}
                />
            </Grid>
        </Grid>
    );
};
