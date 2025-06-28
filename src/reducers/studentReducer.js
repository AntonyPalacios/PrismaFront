import {students} from "../assets/fakeData.jsx";
import {studentActions} from "./studentActions.js";

const initialState = [
    ...students
]


export const studentReducer = (state = initialState, action) => {
    switch (action.type) {
        case studentActions.create:
            return [...state, action.payload];
        case studentActions.update: {

            return state.map((student) =>
                student.id === action.payload.id
                    ? {...student, ...action.payload}
                    :student
            );

        }

        case studentActions.delete:
            return state.filter((student) => student.id !== action.payload.id);

        default:
            return state;
    }
}