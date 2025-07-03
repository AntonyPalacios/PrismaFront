import TextField from "@mui/material/TextField";
import {memo} from "react";

export const MyInput = memo(({label,value, disabled=false,name='name', handleChange=()=>{}, ...props}) => {
    return (
        <TextField
            fullWidth
            size="small"
            disabled={disabled}
            label={label}
            value={value}
            name={name}
            variant="outlined"
            onChange={handleChange}
            {...props}
        />
    );
});
