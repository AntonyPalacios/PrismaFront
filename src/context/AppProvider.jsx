import {AppContext} from "./AppContext.jsx";
import {useMediaQuery, useTheme} from "@mui/material";

export const AppProvider = ({children}) => {

    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
    return (
        <AppContext.Provider value={{isLargeScreen}}>
            {children}
        </AppContext.Provider>
    );
};
