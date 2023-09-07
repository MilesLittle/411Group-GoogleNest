import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles'

const CustomTheme = ({children}) => {
    const theme = createTheme({
        palette: {
           primary: {
                main: '#7BF1A8',
                light: '#D1FAE1'
           },
           secondary: {
                main: '#000000',
                light: '#FFFFFF'
           }
        }
    })
    return (
        <ThemeProvider theme={theme}>
            { children }
        </ThemeProvider>
    )
}
export default CustomTheme

