import {useCallback} from "react";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";

import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useUpdateUserMutation
} from "../store/slices/user/userApiSlice.js";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";

export const useUser = ({toggleForm, onCloseForm, onResetForm})=>{
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Obtén los mutadores y su estado (isLoading, isSuccess, isError, error)
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();


    const onHandleCreate = useCallback(async (formData) => {
        try {
            await createUser(formData).unwrap(); // .unwrap() lanza el error para poderlo capturar con try/catch
            dispatch(toggleAlert({ message: 'Usuario creado correctamente', severity: 'success' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            console.error("Failed to create user:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
    },[createUser, dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) =>{

        try {
            await updateUser(formData).unwrap();
            dispatch(toggleAlert({ message: 'Usuario actualizado correctamente', severity: 'success' }));
        } catch (err) {
            console.error("Failed to update user:", {err});
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
        toggleForm()
    }, [dispatch, toggleForm, updateUser]);

    const onHandleDelete = useCallback(async (formData) =>{

        try {
            await deleteUser(formData.id).unwrap();
            navigate("/users",{
                replace: true,
            })
            dispatch(toggleAlert({ message: 'Usuario borrado correctamente', severity: 'error' }));
        } catch (err) {
            console.error("Failed to delete user:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
        
        
    },[deleteUser, dispatch, navigate]);

    return{
        onHandleCreate,
        onHandleUpdate,
        onHandleDelete
    }
}