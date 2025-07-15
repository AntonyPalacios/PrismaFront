import {useContext, useEffect} from "react";
import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../../components/ui/index.js";
import Search from '@mui/icons-material/Search';
import {stages, studentStates} from "../../../assets/fakeData.jsx";
import {AppContext} from "../../../context/AppContext.jsx";
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

    const {control, watch} = useForm({defaultValues:defaultFormValues});

    const {isLargeScreen} = useContext(AppContext);
    const {data:areas} = useGetAreasQuery();
    const {tutorList} = useSelector((state) => state.user);
    const dispatch = useDispatch();

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
