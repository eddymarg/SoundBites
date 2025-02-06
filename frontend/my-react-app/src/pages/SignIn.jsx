import React from "react"
import axios from "axios"
import { useState } from "react"
import { Typography, Stack, TextField, Button } from "@mui/material"
import { NoteLogo } from "../assets/noteLogo"
import { useNavigate } from "react-router-dom"

const SignIn = () => {
    const navigate = useNavigate();

    // states for input fields
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

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