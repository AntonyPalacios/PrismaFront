import {useCallback, useEffect, useState} from "react";

export const useActionType = ({onHandleCreate,onHandleUpdate,action,disabled,toggleForm,toggleModal,onCloseForm}) =>{
    const [actionType, setActionType] = useState("create");

    const handleConfirmAction = useCallback((formData) => {
        if (actionType === "create") {
            onHandleCreate(formData);
        } else if (actionType === "update") {
            onHandleUpdate(formData);
        } else if (actionType === 'edit-disabled') {
            toggleForm();
        }
    },[actionType, onHandleCreate, onHandleUpdate, toggleForm]);

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