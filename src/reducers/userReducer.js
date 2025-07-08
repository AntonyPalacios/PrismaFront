import {users} from "../assets/fakeData.jsx";
import {userActions} from "./userActions.js";

const initialState = {
    users,
    userAlert: {
        open:false,
        message: "Usuario guardado correctamente",
        severity: "success",
    }
}

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case userActions.create:
            return {
                ...state,
                userAlert: {...state.userAlert, ...action.payload.userAlert},
                users: [...state.users, action.payload.user]
            };
        case userActions.update: {
            return {
                ...state,
                userAlert: {...state.userAlert, ...action.payload.userAlert},
                users: state.users.map((user) =>
                    user.id === action.payload.user.id
                        ? action.payload.user
                        : user
                )
            }

        }

        case userActions.delete:
            return {
                ...state,
                userAlert: {...state.userAlert, ...action.payload.userAlert},
                users: state.users.filter((user) => user.id !== action.payload.id)
            }
        case userActions.toggleAlert:
            return {
                ...state,
                userAlert: {...state.userAlert, open:!state.userAlert.open},
            }
        default:
            return state;
    }
}