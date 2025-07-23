import {useGetAreasQuery, useGetCurrentCycleQuery, useGetCurrentStageQuery} from "../store/slices/api/apiSlice.js";
import {useGetCurrentUserQuery, useGetUserQuery} from "../store/slices/user/userApiSlice.js";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setTutorList} from "../store/slices/user/userSlice.js";
import {setFilter} from "../store/slices/student/studentSlice.js";
import {setCurrentCycle, setCurrentStage} from "../store/slices/cycle/cycleSlice.js";
import {setCurrentUser} from "../store/slices/auth/authSlice.js";

export const useLoadInitialData = () => {
    useGetAreasQuery();

    const dispatch = useDispatch();
    const {data: currentUser,isSuccess:isSuccessCurrentUser} = useGetCurrentUserQuery();
    useEffect(() => {
        if(isSuccessCurrentUser){
            dispatch(setCurrentUser(currentUser));
        }
    },[currentUser, dispatch, isSuccessCurrentUser]);

    const {data: currentCycle, isSuccess:isSuccessCycle} = useGetCurrentCycleQuery();

    useEffect(() => {
        if(isSuccessCycle && currentCycle){
            dispatch(setCurrentCycle(currentCycle));
        }
    },[dispatch,isSuccessCycle,currentCycle]);

    const {data: currentStage, isSuccess:isSuccessStage} = useGetCurrentStageQuery();

    useEffect(() => {
        if(isSuccessStage && currentStage){
            dispatch(setCurrentStage(currentStage));
            dispatch(setFilter({stageId:currentStage.id}))
        }
    },[dispatch,isSuccessStage,currentStage]);

    // Cargar estudiantes ya que si no hay nada, no puede buscar al alumno
    const { data: usersList, isSuccess:isSuccessUser} = useGetUserQuery();

    useEffect(() => {
        if (isSuccessUser && usersList.length > 0) {
            dispatch(setTutorList(usersList));
        }
    }, [dispatch, isSuccessUser, usersList]);

}