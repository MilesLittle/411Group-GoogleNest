import React, { useContext } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles'
import DarkModeSwitchContext from "./DarkModeSwitchContext";

const CustomTheme = ({children}) => {
    const { switched } = useContext(DarkModeSwitchContext) 

    const lighttheme = createTheme({
        palette: {
           primary: { 
                main: '#7BF1A8',
                light: '#D1FAE1',
                dark: '#46ec86',
                contrastText: '#000000'
           },
           secondary: { 
                main: '#000000',
                light: '#7BF1A8',
                contrastText: '#FFFFFF'
           }
        },
        typography: {
            fontFamily: 'Google Sans' 
        }
    })

    const darktheme = createTheme({ 
        palette: {
           primary: { 
                main: '#7BF1A8',
                light: '#D1FAE1',
                dark: '#46ec86',
                contrastText: '#7BF1A8'
           },
           secondary: {
                main: '#000000',
                light: '#7BF1A8',
                contrastText: '#FFFFFF'
           }
        },
        typography: {
            h3: {
                color: '#7BF1A8'
            }, 
            fontFamily: 'Google Sans',
        }
    })

    return (
        <ThemeProvider theme={ switched ? darktheme : lighttheme }>
            { children }
        </ThemeProvider>
    )
}
export default CustomTheme

