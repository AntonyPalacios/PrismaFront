import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {memo} from "react";
import {FormHelperText} from "@mui/material";

export const MySelect = memo(({label='Etiqueta', options=[],name, disabled=false,error = false, // <-- Recibe el estado de error
                                  helperText = null,defaultItem="Seleccione una opción", ...props}) => {
    return (
        <FormControl fullWidth size="small" disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                name={name}
                variant="outlined"
                {...props}
            >
                <MenuItem value={0}>
                    <em>{defaultItem}</em>
                </MenuItem>
                {options.map((option) =>
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                )}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
});
