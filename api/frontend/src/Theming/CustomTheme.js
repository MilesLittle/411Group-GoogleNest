import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles'

const CustomTheme = ({children}) => {
    const theme = createTheme({ //take text color into account with themes?
        palette: {
           primary: {
                main: '#7BF1A8',
                light: '#D1FAE1'
           },
           secondary: {
                main: '#000000',
                light: '#FFFFFF'
           }
        },
        typography: {
            fontFamily: 'Google Sans' //want Product Sans
        }
    })
    //make a dark theme and pass that (const darktheme = createTheme({})). Switch between theme and darktheme with a context
    //state above this controlled by a switch in the navbar, like how login state is set with context api hooks
    //const [darkMode, setDarkMode] = useState(false)
    // <ThemeProvider theme={{darkmode ? (darktheme) : (theme)}}
    return (
        <ThemeProvider theme={theme}>
            { children }
        </ThemeProvider>
    )
}
export default CustomTheme

