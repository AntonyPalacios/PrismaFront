import {useGetAreasQuery} from "../store/slices/api/apiSlice.js";
import {useGetUserQuery} from "../store/slices/user/userApiSlice.js";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setTutorList} from "../store/slices/user/userSlice.js";
import {useGetStudentsQuery} from "../store/slices/student/studentsApiSlice.js";
import {setStudents} from "../store/slices/student/studentSlice.js";

export const useLoadInitialData = () => {
    useGetAreasQuery();

    const dispatch = useDispatch();

    // Cargar estudiantes ya que si no hay nada, no puede buscar al alumno
    const { data: usersList, isSuccess:isSuccessUser} = useGetUserQuery();

    useEffect(() => {
        if (isSuccessUser && usersList.length > 0) {
            dispatch(setTutorList(usersList));
        }
    }, [dispatch, isSuccessUser, usersList]);

    const {data: studentsList, isSuccess:isSuccessStudent} = useGetStudentsQuery();
    useEffect(() => {
        if (isSuccessStudent && studentsList.length > 0) {
            console.log(studentsList);
            dispatch(setStudents(studentsList));
        }
    }, [dispatch, isSuccessStudent, studentsList]);
}