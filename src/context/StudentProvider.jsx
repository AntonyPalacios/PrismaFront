import {StudentContext} from "./StudentContext.jsx";
import {useReducer} from "react";
import {studentReducer} from "../reducers/studentReducer.js";

import {students} from "../assets/fakeData.jsx";
import {studentActions} from "../reducers/studentActions.js";

const initialState = {
    students,
    studentAlert: {
        open:false,
        message: "Alumno guardado correctamente",
        severity: "success",
    }
}


export const StudentProvider = ({children}) => {

    const [state, dispatch] = useReducer(studentReducer,initialState);

    const onCreateStudent = (action) => {
        dispatch(action);
    }

    const onUpdateStudent = (action) => {
       dispatch(action)
    }

    const onDeleteStudent = (action) => {
        dispatch(action)
    }

    const onToggleAlert = () => {
        dispatch({type:studentActions.toggleAlert})
    }

    return (
        <StudentContext.Provider value={{state, onCreateStudent, onUpdateStudent, onDeleteStudent, onToggleAlert}}>
            {children}
        </StudentContext.Provider>
    );
};
