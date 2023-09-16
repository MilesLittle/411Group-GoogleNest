import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles'

const CustomTheme = ({children}) => {
    const lighttheme = createTheme({ //take text color into account with themes?
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
    //make a dark theme and pass that (const darktheme = createTheme({})). Switch between theme and darktheme with a context
    //state above this controlled by a switch in the navbar, like how login state is set with context api hooks
    //const [darkMode, setDarkMode] = useState(false)
    // <ThemeProvider theme={{darkmode ? (darktheme) : (theme)}}
    return (
        <ThemeProvider theme={lighttheme}>
            { children }
        </ThemeProvider>
    )
}
export default CustomTheme

