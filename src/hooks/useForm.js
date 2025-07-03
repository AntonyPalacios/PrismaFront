import {useState} from "react";

export const useForm = (initialForm = {}) => {
    const [formState, setFormState] = useState(initialForm)

    const onInputChange = ({target}) => {
        const {name, value} = target
        setFormState(prev => ({
            ...prev,
            [name]: value === 'true' || value === 'false' ? Boolean(value) : value,
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