import {AppContext} from "./AppContext.jsx";
import {useMediaQuery, useTheme} from "@mui/material";
import {useState} from "react";
import {currentUser} from "../assets/fakeData.jsx"

export const AppProvider = ({children}) => {

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const [user, setUser] = useState(currentUser);
    return (
        <AppContext.Provider value={{isLargeScreen, user, setUser}}>
            {children}
        </AppContext.Provider>
    );
};
