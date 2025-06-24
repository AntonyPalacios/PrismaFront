import Button from "@mui/material/Button";

export const MyButton = ({children, color='primary', disabled, size, variant='contained',sx, onClick}) => {
    return (
        <Button
            color={color}
            disabled={disabled}
            size={size}
            variant={variant}
            sx ={sx}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};
