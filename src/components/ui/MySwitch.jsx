import {FormControlLabel, Switch} from "@mui/material";

export const MySwitch = ({label,disabled,value,name,onInputChange,checked}) => {

    return (
        <FormControlLabel
        label={label}
        control={
            <Switch
                disabled={disabled}
                size="small"
                value={value}
                name={name}
                checked={checked}
                onChange={onInputChange}/>
        }
        />

    );
};
