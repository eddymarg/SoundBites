import React from "react"
import axios from "axios"
import { useState } from "react"
import { Typography, Stack, TextField, Button} from "@mui/material"
import { useNavigate } from "react-router-dom"
import signupImage from "../assets/signup-img.png"

const EmailSignup = () => {
    const navigate = useNavigate()
    
    // state for form inputs
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSignUp = async () => {
        try {
            const response = await axios.post("http://localhost:5001/signup", {
                name,
                email,
                password
            })

            // store token in local storage
            localStorage.setItem("token", response.data.token)

            navigate("/userHome")
        } catch (err) {
            setError(err.response?.data?.msg || "Sign-up failed")
        }
    }

    return(
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ height: "100vh"}}>
            <img src={signupImage} alt="signup image" style={{ width: "50%", height: "auto"}}/>
            <Stack direction="column" spacing={2} sx={{ width: "50%"}}>
                <Typography 
                    fontSize='56px'
                    sx={{
                        fontFamily: "'Tinos', serif", fontWeight: 700, 
                        color: '#EF233C'
                    }}
                >Welcome to the <br /> community!</Typography>
                <Typography fontSize='40px' fontWeight={700}>Sign Up</Typography>
                <TextField 
                    id="outlined-basic" 
                    label="Name" 
                    variant="outlined" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{
                        width: '428px'
                    }}
                />
                <TextField 
                    id="outlined-basic" 
                    label="Email" 
                    variant="outlined" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                        width: '428px'
                    }}
                />
                <TextField 
                    id="outlined-basic" 
                    label="Password" 
                    variant="outlined" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                        width: '428px'
                    }}
                />
                {error && <Typography color="error">{error}</Typography>}

                <Button onClick={handleSignUp}>Sign Up</Button>
            </Stack>
        </Stack>
    )
}

export default EmailSignup