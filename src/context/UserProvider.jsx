import {UserContext} from "./UserContext.jsx";
import {useReducer} from "react";
import {userReducer} from "../reducers/userReducer.js";

import {users} from "../assets/fakeData.jsx";
import {userActions} from "../reducers/userActions.js";

const initialState = {
    users,
    userAlert: {
        open:false,
        message: "Alumno guardado correctamente",
        severity: "success",
    }
}


export const UserProvider = ({children}) => {

    const [state, dispatch] = useReducer(userReducer,initialState);

    const onCreateUser = (action) => {
        dispatch(action);
    }

    const onUpdateUser = (action) => {
        dispatch(action)
    }

    const onDeleteUser = (action) => {
        dispatch(action)
    }

    const onToggleAlert = () => {
        dispatch({type:userActions.toggleAlert})
    }

    return (
        <UserContext.Provider value={{state, onCreateUser, onUpdateUser, onDeleteUser, onToggleAlert}}>
            {children}
        </UserContext.Provider>
    );
};
