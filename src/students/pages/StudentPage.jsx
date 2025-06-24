import {Grid} from "@mui/material";
import {Title} from "../../components/ui/Title.jsx";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";

export const StudentPage = () => {
    const {isLargeScreen} = useContext(AppContext);
    const variant = () =>{
        return isLargeScreen? "h4":"h6"
    }

    return (
        <Grid container>
            <Grid size={12}>
                <Title
                    variant={variant}
                >Alumnos</Title>
            </Grid>
        </Grid>
    );
};
