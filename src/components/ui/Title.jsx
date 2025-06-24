import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {Grid} from "@mui/material";

export const Title = ({children, variant}) => {
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
