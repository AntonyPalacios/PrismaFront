import {students} from "../assets/fakeData.jsx";
import {studentActions} from "./studentActions.js";

const initialState = {
    students,
    studentAlert: {
        open:false,
        message: "Alumno guardado correctamente",
        severity: "success",
    }
}


export const studentReducer = (state = initialState, action) => {
    switch (action.type) {
        case studentActions.create:
            return {
                ...state,
                studentAlert: {...state.studentAlert, ...action.payload.studentAlert},
                students: [...state.students, action.payload.student]
            };
        case studentActions.update: {
            return {
                ...state,
                studentAlert: {...state.studentAlert, ...action.payload.studentAlert},
                students: state.students.map((student) =>
                    student.id === action.payload.student.id
                        ? {...student, ...action.payload.student}
                        : student
                )
            }

        }

        case studentActions.delete:
            return {
                ...state,
                studentAlert: {...state.studentAlert, ...action.payload.studentAlert},
                students: state.students.filter((student) => student.id !== action.payload.id)
            }
            case studentActions.toggleAlert:
                return {
                    ...state,
                    studentAlert: {...state.studentAlert, open:!state.studentAlert.open},
                }
        default:
            return state;
    }
}