import {StudentContext} from "./StudentContext.jsx";
import {useReducer} from "react";
import {studentReducer} from "../reducers/studentReducer.js";

import {students} from "../assets/fakeData.jsx";

const initialState = [
    ...students
]


export const StudentProvider = ({children}) => {

    const [students, dispatch] = useReducer(studentReducer,initialState);

    const onCreateStudent = (action) => {
        dispatch(action);
    }

    const onUpdateStudent = (action) => {
       dispatch(action)
    }

    const onDeleteStudent = (action) => {
        dispatch(action)
    }

    return (
        <StudentContext.Provider value={{students, onCreateStudent, onUpdateStudent, onDeleteStudent}}>
            {children}
        </StudentContext.Provider>
    );
};
