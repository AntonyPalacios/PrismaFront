import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

export const MySelect = ({label='Etiqueta',value, options=[],name, disabled=false, handleChange=()=>{
    console.log(`handleChange de ${label}`)}}) => {
    return (
        <FormControl fullWidth size="small" disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                label={label}
                name={name}
                variant="outlined"
                onChange={handleChange}
            >
                {options.map((option) =>
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    );
};
