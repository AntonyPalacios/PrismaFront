import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {exams} from "../../../assets/fakeData.jsx";
import {useForm} from "../../../hooks/useForm.js";
import {useEffect} from "react";

let initialForm = {
    id:null,
    name:'',
    date:null,
    stage:null
}

export const ExamForm = ({id}) => {
    const {name, date, stage, setFormState, onInputChange} = useForm(initialForm);

    useEffect(() => {
        if(id){
            const exam = exams.find(x => x.id === id);
            setFormState(exam);
        }

    },[id])

    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12, md:12}}>
                <MyInput
                    label="Nombre"
                    name="name"
                    value={name}
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs:12, md:6}}>
                <MyInput
                    label="Fecha"
                    name="date"
                    type="date"
                    value={date}
                    handleChange={onInputChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <Grid size={{xs:12, md:6}}>
                <MySelect
                    label="Etapa"
                    name="stage.id"
                    value={stage.id}
                    handleChange={onInputChange}
                    options={etapas}
                />
            </Grid>
            <MyActionButtons/>
        </Grid>
    );
};
