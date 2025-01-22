// Root component of application
import React from "react"
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from "react-router-dom"
import Home from "./pages/home"

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
      <RouterProvider router={router}/>
    </>
  )
}

export default App
