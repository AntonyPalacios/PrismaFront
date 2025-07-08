import {useCallback, useContext} from "react";
import {UserContext} from "../context/UserContext.jsx";
import {useNavigate} from "react-router";
import {userActions} from "../reducers/userActions.js";

export const useUser = ({toggleForm, onCloseForm, onResetForm})=>{
    const {onCreateUser, onUpdateUser, onDeleteUser} = useContext(UserContext);
    const navigate = useNavigate();

    const buildUserObject = (currentFormState,override={}) => ({
        id: override.id ?? currentFormState.id ?? new Date().getTime(),
        name: override.name ?? currentFormState.name,
        email: override.email ?? currentFormState.email,
        isAdmin: override.isAdmin ?? currentFormState.isAdmin,
        isTutor: override.isTutor ?? currentFormState.isTutor,
        isActive: override.isActive ?? currentFormState.isActive,
    })

    const onHandleCreate = useCallback((formData) => {

        const user = buildUserObject(formData,{ id: new Date().getTime() });

        const action = {
            type:userActions.create,
            payload: {
                user,
                userAlert:{
                    open:true,
                    message:"Usuario creado correctamente",
                    severity:"success",
                }
            }
        }
        onCreateUser(action)
        onResetForm()
        onCloseForm();
    },[onCreateUser, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback((formData) =>{

        const user = buildUserObject(formData);

        const action = {
            type:userActions.update,
            payload: {
                user,
                userAlert:{
                    open:true,
                    message:"Usuario actualizado correctamente",
                    severity:"success",
                }
            }}
        onUpdateUser(action);
        toggleForm();
    }, [onUpdateUser, toggleForm]);

    const onHandleDelete = useCallback((formData) =>{

        const action = {
            type:userActions.delete,
            payload: {id:formData.id,
                userAlert:{
                    open:true,
                    message:"Usuario borrado correctamente",
                    severity:"error",
                }
            }}
        onDeleteUser(action)
        navigate("/users",{
            replace: true,
        })
    },[navigate, onDeleteUser]);

    return{
        onHandleCreate,
        onHandleUpdate,
        onHandleDelete
    }
}