import {useState} from "react";

export const useModal = ({title,confirmText="Aceptar", cancelText = "Cancelar"})=> {
    const [open, setOpen] = useState(false)
    const toggleModal = () => {
        setOpen(!open)
    }

    return{
        title,
        confirmText,
        cancelText,
        open,
        toggleModal,
    }
}