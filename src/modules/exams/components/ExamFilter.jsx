import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../../components/ui/index.js";
import {useContext, useEffect} from "react";
import Search from '@mui/icons-material/Search';
import {AppContext} from "../../../context/AppContext.jsx";
import {useGetCyclesQuery, useGetStagesQuery} from "../../../store/slices/cycle/cycleApiSlice.js";
import {Controller, useForm} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {setFilter} from "../../../store/slices/exam/examSlice.js";

const defaultFormValues = {
    cycleId:-1,
    stageId:-1,
    filterName:''
}

export const ExamFilter = () => {
    const {isLargeScreen} = useContext(AppContext);
    const dispatch = useDispatch();
    
    const {control, watch, setValue} = useForm({defaultValues:defaultFormValues});

    const {data:cycles} = useGetCyclesQuery();

    const {currentCycle,currentStage} = useSelector((state) => state.cycle);
    const {data:stages} = useGetStagesQuery(currentCycle?.id, {
        skip: !currentCycle, // Skip the query if currentCycle.id is null or undefined
    });

    useEffect(() => {
        if(currentStage && currentStage.id && watch('stageId') === -1) {
            setValue('stageId', currentStage.id, { shouldDirty: true });
            const updatedFormValues = { ...watch(), stageId: currentStage.id };
            dispatch(setFilter(updatedFormValues));
        }
    }, [currentStage, dispatch, setValue, watch]);

    useEffect(() => {
        if(currentCycle && currentCycle.id && watch('cycleId') === -1) {
            setValue('cycleId', currentCycle.id, { shouldDirty: true });
            const updatedFormValues = { ...watch(), cycleId: currentCycle.id };
            dispatch(setFilter(updatedFormValues));
        }
    }, [currentCycle, dispatch, setValue, watch]);

    useEffect(() => {

        const subscription = watch((value) => {
            dispatch(setFilter(value));
        });

        return () => subscription.unsubscribe();
    }, [watch, dispatch]);
    
    return (
        <Grid container spacing={2}>
            <Grid size={{xs:3,md:6}}>
                <Controller
                    name="cycleId"
                    control={control}
                    render={({ field }) => (
                        <MySelect
                            {...field}
                            options={cycles}
                            label="Ciclo"
                            isForm={true}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs:3,md:6}}>
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
            <Grid size={{xs:4,md:10}}>
                <MyInput
                    label="Nombre"
                    name="name"
                />
            </Grid>
            <Grid size={{xs:2,md:2}} display="flex" justifyContent="flex-end">
                <MyButton>{isLargeScreen?"Buscar":<Search/>}</MyButton>
            </Grid>
        </Grid>
    );
};
