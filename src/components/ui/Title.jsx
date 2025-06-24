import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export const Title = ({children, variant}) => {
    return (
        <div className="title">
            <Typography
                variant={variant}
                sx={{fontWeight: 'bold', color: "primary.main"}}
            >
                {children.toString().toUpperCase()}
            </Typography>
            <Divider
                sx={{
                    mt: 1,
                    backgroundColor: "secondary.main",
                    height: "2px",
                }}
            />
        </div>
    );
};
