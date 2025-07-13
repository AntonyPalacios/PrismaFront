import {useGetAreasQuery} from "../store/slices/api/apiSlice.js";
import {useGetUserQuery} from "../store/slices/user/userApiSlice.js";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setTutorList} from "../store/slices/user/userSlice.js";

export const useLoadInitialData = () => {
    useGetAreasQuery();
    useGetUserQuery();

    const dispatch = useDispatch();

    // Cargar estudiantes ya que si no hay nada, no puede buscar al alumno
    const { data: usersList, isSuccess} = useGetUserQuery();
    useEffect(() => {
        if (isSuccess && usersList.length > 0) {
            dispatch(setTutorList(usersList));
        }
    }, [dispatch, isSuccess, usersList]);
}