import {useState} from "react";

export const useForm = (initialForm = {}) => {
    const [formState, setFormState] = useState(initialForm)

    const onInputChange = ({target}) => {
        const {name, value} = target
        if (value === 'true' || value === 'false') {
            setFormState({
                ...formState,
                [name]: Boolean(value),
            })
        } else {
            setFormState({
                ...formState,
                [name]: value,
            })
        }

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