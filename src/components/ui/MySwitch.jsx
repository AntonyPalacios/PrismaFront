import {FormControlLabel, Switch} from "@mui/material";
import {memo} from "react";

export const MySwitch = memo(({label,disabled,name,handleChange,checked}) => {
    return (
        <FormControlLabel
        label={label}
        control={
            <Switch
                disabled={disabled}
                size="small"
                name={name}
                checked={checked}
                onChange={handleChange}/>
        }
        />

    );
});
