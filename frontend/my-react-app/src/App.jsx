// Root component of application
import React from "react"
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from "react-router-dom"
import { createTheme, ThemeProvider } from '@mui/material'
import Home from "./pages/home"

const theme = createTheme({
  palette: {
    basic: {
      main: '#FFFFFF',
      dark: '#EF233C50',
    },
    mainRed: {
      main: '#EF233C',
      light: '#EF233C70',
    }
  }
})

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />}/>
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
