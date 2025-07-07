import {useCallback, useEffect, useState} from "react";

export const useActionType = ({onHandleCreate,onHandleUpdate,action,disabled,toggleForm,toggleModal,onCloseForm}) =>{
    const [actionType, setActionType] = useState("create");

    // En cada render, usamos el estado actualizado
    const handleConfirmAction = useCallback((formState) => {
        console.log("render handleConfirmAction");
        if (actionType === "create") {
            onHandleCreate(formState);
        } else if (actionType === "update") {
            onHandleUpdate(formState);
        } else if (actionType === 'edit-disabled') {
            toggleForm();
        }
    },[actionType, toggleForm]);

    const handleCancelAction = useCallback(() => {
        console.log("render handleCancleAction");
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