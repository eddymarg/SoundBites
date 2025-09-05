import React from "react"
import axios from "axios"
import { useState } from "react"
import { Typography, Stack, TextField, Button, Box, InputAdornment, IconButton } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { NoteLogo } from "../assets/noteLogo"
import { useNavigate } from "react-router-dom"
import { Logo } from "../assets/Logo"
import signinImage from "../assets/signin-img.png"
import CustomTextField from "../components/customTextField"

const SignIn = () => {
    const navigate = useNavigate();

    // states for input fields
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    
    const handleClickShowPassword = () => setShowPassword((show) => !show)
    const handleMouseDownPassword = (event) => event.preventDefault()
    const handleMouseUpPassword = (event) => event.preventDefault()

    const handleSignIn = async () => {
        setError("")
        setEmailError("")
        setPasswordError("")

        const errors = []
        const missingFields = []

        if(!email) missingFields.push("Email")
        if(!password) missingFields.push("Password")
        
        if(missingFields.length == 2) {
            errors.push("All fields required")
        } else if (missingFields.length > 0){
            errors.push(`${missingFields} is required`)
        } 

        if(errors.length > 0) {
            setError(errors.join("\n"))
            return
        }

        try {
            const response = await axios.post("http://localhost:5001/api/auth/login", {
                email,
                password
            })

            // store token in local storage
            localStorage.setItem("token", response.data.token)

            console.log("Signin successful, navigating to /userHome")
            navigate("/userHome")
        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Sign-up failed"

            if(errorMsg === "Email not found") {
                setEmailError(errorMsg)
            } else if (errorMsg === "Incorrect password") {
                setPasswordError(errorMsg)
            } else {
                setError(errorMsg)
            }
        }
    }

    return(
        <Box sx={{ position: "relative", height: "100vh" }}>
            <Box 
                onClick={() => navigate("/")}
                sx={{ 
                    position: "absolute", 
                    top: "10px", 
                    right: "10px", 
                    zIndex: 10,
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.1)"
                    }
                }}
            >
                <Logo />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ height: "100vh"}}>
                <img 
                    src={signinImage} 
                    alt="signin image" 
                    style={{ 
                        width: "auto", 
                        height: "95vh",
                        objectFit: "cover",
                        margin: "2px 0 2px 2px",
                        flexShrink: 0
                    }}
                />
                <Stack direction="column" spacing={2} sx={{ width: "50%"}}>
                    <Typography
                        fontSize='52px'
                        sx={{
                            fontFamily: "'Tinos', serif", fontWeight: 700, 
                            color: '#EF233C'
                        }}
                    >
                        Welcome Back!</Typography>
                    <NoteLogo />
                    <Typography fontSize='36px' fontWeight={700}>Log In</Typography>
                    <CustomTextField 
                        id="outlined-basic email" 
                        label="Spotify email" 
                        variant="outlined" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!emailError}
                        helperText={emailError}
                        sx={{
                            width: '428px',
                        }}
                    />
                    <CustomTextField
                        id="outlined-basic password" 
                        label="Password" 
                        variant="outlined" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{ width: '428px' }}
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>

                                </InputAdornment>
                            )
                        }}
                    />
                    {error && <Typography color="error"
                        sx={{ 
                            whiteSpace: 'pre-line',
                        }}>
                            {error}
                    </Typography>}
                    <Button
                        onClick={handleSignIn} variant="contained"
                        color="basic"
                        sx={{
                            width: '428px',
                            height: '49px',
                            color: '#0D1B2A',
                            fontSize: '24px',
                            borderRadius: '36px',
                            boxShadow: '-8px 8px 0 #EF233C',
                            textTransform: "none",
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >Log In</Button>
                </Stack>
            </Stack>
        </Box>
    )
}

export default SignIn