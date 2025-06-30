import TextField from "@mui/material/TextField";

export const MyInput = ({label,value, disabled=false,name='name', handleChange=()=>{}, ...props}) => {
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
};
