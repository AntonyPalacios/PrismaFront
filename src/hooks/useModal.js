import {useCallback, useState} from "react";

export const useModal = ({title="Título",confirmText="Aceptar", cancelText = "Cancelar"})=> {
    const [open, setOpen] = useState(false)
    const toggleModal = useCallback(() => {
        setOpen(!open)
    },[open]);

    return{
        title,
        confirmText,
        cancelText,
        open,
        toggleModal,
    }
}