import React, { useContext } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles'
import DarkModeSwitchContext from "../components/NavBar/Dark Mode/DarkModeSwitchContext";

const CustomTheme = ({children}) => {
    const { switched, setSwitched } = useContext(DarkModeSwitchContext) 

    const lighttheme = createTheme({
        palette: {
           primary: { //primary components (some shade of green w black text)
                main: '#7BF1A8',
                light: '#D1FAE1',
                dark: '#5DEE95',
                contrastText: '#000000'
           },
           secondary: { //secondary components (black w white or green text)
                main: '#000000',
                light: '#7BF1A8',
                contrastText: '#FFFFFF'
           }
        },
        typography: {
            fontFamily: 'Google Sans' //want Product Sans
        }
    })

    const darktheme = createTheme({ 
        palette: {
           primary: { 
                main: '#7BF1A8',
                light: '#D1FAE1',
                dark: '#5DEE95',
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

