import {FormControlLabel, Switch} from "@mui/material";
import {memo} from "react";

export const MySwitch = memo(({label,disabled,name,...props}) => {
    return (
        <FormControlLabel
        label={label}
        control={
            <Switch
                disabled={disabled}
                size="small"
                name={name}
                {...props}
            />
        }
        />

    );
});
