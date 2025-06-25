import {FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {Title} from "../../components/ui/Title.jsx";
import {useContext, useEffect, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import {MyButton} from "../../components/ui/MyButton.jsx";
import {StudentFilter} from "../components/StudentFilter.jsx";
import {StudentTable} from "../components/StudentTable.jsx";
import StudentFAB from "../components/StudentFAB.jsx";
import { Outlet } from "react-router";

export const StudentPage = () => {
    const {isLargeScreen} = useContext(AppContext);
    const [variant, setVariant] = useState("h4");
    useEffect(()=>{
        isLargeScreen? setVariant("h4"): setVariant("h6");
    },[isLargeScreen]);

    return (
        <Grid container spacing={2}>
            <Title variant={variant}>Alumnos</Title>
            <Outlet/>
        </Grid>
    );
};
