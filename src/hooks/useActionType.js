import {useCallback, useEffect, useState} from "react";

export const useActionType = ({action,disabled,toggleForm,toggleModal,onCloseForm,triggerSubmit = () =>{}}) =>{
    const [actionType, setActionType] = useState("create");

    const handleConfirmAction = useCallback((formData) => {
        console.log("handleConfirmAction", formData)
        if (actionType === "create" || actionType === "update") {
            triggerSubmit();
        } else if (actionType === 'edit-disabled') {
            toggleForm();
        }
    },[actionType, toggleForm, triggerSubmit]);

    const handleCancelAction = useCallback(() => {
        if (actionType !== "create") {
            toggleModal();
        }else{
            onCloseForm();
        }
    },[actionType, onCloseForm, toggleModal]);

    useEffect(() => {
        if (action === "edit") {
            if (disabled) {
                setActionType("edit-disabled");
            } else {
                setActionType("update");
            }
        } else {
            setActionType("create");
        }
    }, [action, disabled]);
    return{
        actionType,
        handleConfirmAction,
        handleCancelAction
    }
}