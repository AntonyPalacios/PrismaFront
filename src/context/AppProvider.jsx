import {AppContext} from "./AppContext.jsx";
import {useMediaQuery, useTheme} from "@mui/material";
import {useState} from "react";
import {fakeUser} from "../assets/fakeData.jsx"

export const AppProvider = ({children}) => {

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    const [user, setUser] = useState(fakeUser);
    return (
        <AppContext.Provider value={{isLargeScreen, user, setUser}}>
            {children}
        </AppContext.Provider>
    );
};
