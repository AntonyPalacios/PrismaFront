import TextField from "@mui/material/TextField";
import {memo} from "react";

export const MyInput = memo(({label, disabled=false,name, ...props}) => {
    return (
        <TextField
            fullWidth
            size="small"
            disabled={disabled}
            label={label}
            name={name}
            variant="outlined"
            {...props}
        />
    );
});
