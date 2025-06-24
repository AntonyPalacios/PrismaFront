import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {PrismaApp} from './PrismaApp.jsx'
import {ThemeProvider} from "@mui/material";
import theme from './assets/theme.js';
import {BrowserRouter} from "react-router";


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <PrismaApp/>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
)
