import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {Grid} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";

export const MyTitle = ({children}) => {
    const {isLargeScreen} = useContext(AppContext);
    const [variant, setVariant] = useState("h4");
    useEffect(()=>{
        isLargeScreen? setVariant("h4"): setVariant("h6");
    },[isLargeScreen]);
    return (
        <Grid  size={12}>
            <Typography
                variant={variant}
                sx={{fontWeight: 'bold', color: "primary.main"}}
            >
                {children.toString().trim().toUpperCase()}
            </Typography>
            <Divider
                sx={{
                    mt: 1,
                    backgroundColor: "secondary.main",
                    height: "2px",
                }}
            />
        </Grid>
    );
};
