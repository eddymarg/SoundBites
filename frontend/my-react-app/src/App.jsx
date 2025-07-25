// Root component of application
import React from "react"
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from "react-router-dom"
import { createTheme, ThemeProvider } from '@mui/material'
import Home from "./pages/home"
import SignIn from "./pages/SignIn"
import EmailSignup from "./pages/EmailSignUp"
import UserHome from "./pages/loggedinHome"
import SavedRestaurantsPage from "./pages/savedRecs"
import LoadingScreen from "./components/LoadingScreen"

const theme = createTheme({
  palette: {
    basic: {
      main: '#FFFFFF',
      dark: '#EF233C50',
    },
    mainRed: {
      main: '#EF233C',
      light: '#EF233C70',
    },
    mainYellow: {
      main: '#FFBF69',
    }
  }
})

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />}/>
      <Route path="signin" element={<SignIn />}/>
      <Route path="emailSignup" element={<EmailSignup />}/>
      <Route path="userHome" element={<UserHome />}/>
      <Route path="savedRestaurantsPage" element={<SavedRestaurantsPage />}/>
      <Route path="loadingScreen" element={<LoadingScreen />} />
    </Route>
  )
)

function App({routes}) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router}/>
      </ThemeProvider>
    </>
  )
}

export default App
