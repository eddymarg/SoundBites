import React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Typography, Stack, TextField, Button } from "@mui/material"
import { Logo } from "../assets/Logo"

const EmailSignup = () => {
    const { loginWithRedirect } = useAuth0();

    return(
        <Stack>
            <Typography>Welcome to the community!</Typography>
            <Typography>Sign Up</Typography>
            <TextField id="outlined-basic" label="Name" variant="outlined" />
            <TextField id="outlined-basic" label="Email" variant="outlined" />
            <TextField id="outlined-basic" label="Password" variant="outlined" />
            <Button onClick={() => loginWithRedirect({ screen_hint: "sign up" })}>Sign Up</Button>
        </Stack>
    )
}

export default EmailSignup