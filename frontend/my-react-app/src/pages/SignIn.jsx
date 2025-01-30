import React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Typography, Stack, TextField, Button } from "@mui/material"
import { Logo } from "../assets/Logo"
import { NoteLogo } from "../assets/noteLogo"

const SignIn = () => {
    const { loginWithRedirect } = useAuth0();

    return(
        <Stack>
            <Typography>Welcome Back!</Typography>
            <NoteLogo />
            <Typography>Log In</Typography>
            <TextField id="outlined-basic" label="Email" variant="outlined" />
            <TextField id="outlined-basic" label="Password" variant="outlined" />
            <Button onClick={() => loginWithRedirect({ screen_hint: "login" })}>Log In</Button>
        </Stack>
    )
}

export default SignIn