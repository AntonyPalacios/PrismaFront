import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {PrismaApp} from './PrismaApp.jsx'
import {ThemeProvider} from "@mui/material";
import theme from './assets/theme.js';
import {BrowserRouter} from "react-router";
import {Provider} from "react-redux";
import {store} from "./store/store.js";


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <PrismaApp/>
                </ThemeProvider>
            </BrowserRouter>
        </Provider>
    </StrictMode>
)
