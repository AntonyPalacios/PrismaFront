import {useState} from "react";

export const useForm = (initialForm = {}) => {
    const [formState, setFormState] = useState(initialForm)

    const onInputChange = ({target}) => {
        const {name, value,type,checked} = target
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

    }

    const onResetForm = () => {
        setFormState(initialForm)
    }
    return {
        ...formState,
        formState,
        onInputChange,
        onResetForm,
        setFormState
    }
}