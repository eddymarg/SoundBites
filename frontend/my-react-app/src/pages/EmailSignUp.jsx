import React from "react"
import axios from "axios"
import { useState } from "react"
import { Typography, Stack, TextField, Button, Box, IconButton, InputAdornment} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Logo } from "../assets/Logo"
import signupImage from "../assets/signup-img.png"
import CustomTextField from "../components/customTextField"
import { Visibility, VisibilityOff } from "@mui/icons-material"


const EmailSignup = () => {
    const navigate = useNavigate()
    
    // state for form inputs
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleClickShowPassword = () => setShowPassword((show) => !show)

    const handleMouseDownPassword = (event) => event.preventDefault()
    const handleMouseUpPassword = (event) => event.preventDefault()

    const handleSignUp = async () => {
        setError("")
        setEmailError("")
        setPasswordError("")

        const errors = []

        // basic validation
        const missingFields = []

        if (!name) missingFields.push("Name")
        if (!email) missingFields.push("Email")
        if (!password) missingFields.push("Password")

        if(missingFields.length === 3) {
            errors.push("All fields are required")
        } else if (missingFields.length > 0) {
            errors.push(`${missingFields.join(" and ")} ${missingFields.length > 1? "are" : "is"} required`)
        }

        // email validation
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
            if(!emailRegex.test(email)) {
                setEmailError("Invalid email format")
            }
        }

        // password validation
        if (password) {
            if(password.length < 8) {
                setPasswordError("Password must be at least 8 characters long")
            }
            if(!/[A-Z]/.test(password)) {
                setPasswordError("Password must contain at least one uppercase letter")
            }
            if(!/[!@#$%&*,.?:]/.test(password)) {
                setPasswordError("Password must include at least one special character")
            }
        }

        if(errors.length > 0 || emailError || passwordError) {
            setError(errors.join("\n"))
            return
        }

        try {
            const response = await axios.post("http://localhost:5001/api/auth/signup", {
                name,
                email,
                password
            })

            // store token in local storage
            localStorage.setItem("token", response.data.token)

            console.log("Signup successful, navigating to /userHome")
            navigate("/userHome")
        } catch (err) {
            setError(err.response?.data?.msg || "Sign-up failed")
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
                    src={signupImage} 
                    alt="signup image" 
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
                    >Welcome to the <br /> community!</Typography>
                    <Typography fontSize='36px' fontWeight={700}>Sign Up</Typography>
                    <CustomTextField 
                        id="outlined-basic name" 
                        label="Name" 
                        variant="outlined" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            width: '428px',
                        }}
                    />
                    <CustomTextField 
                        id="outlined-basic email" 
                        label="Spotify Email" 
                        variant="outlined" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            width: '428px',
                        }}
                    />
                    {emailError && <Typography color="error"
                        sx={{ 
                            whiteSpace: 'pre-line',
                            fontSize: '12px',
                            pl: 3,
                        }}
                    >
                        {emailError}
                    </Typography>}
                    <CustomTextField
                        id="outlined-basic password" 
                        label="Password" 
                        variant="outlined" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    {passwordError && <Typography color="error"
                        sx={{ 
                            whiteSpace: 'pre-line',
                            fontSize: '12px',
                            pl: 3,
                        }}
                    >
                        {passwordError}
                    </Typography>}

                    {error && <Typography color="error"
                        sx={{ 
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {error}
                    </Typography>}

                    <Button 
                        onClick={handleSignUp} variant="contained"
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
                    >Sign Up</Button>
                </Stack>
            </Stack>
        </Box>
    )
}

export default EmailSignup