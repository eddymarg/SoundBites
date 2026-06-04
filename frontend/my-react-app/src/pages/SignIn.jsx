import React from "react"
import axios from "axios"
import { useState } from "react"
import { Typography, Stack, TextField, Button, Box, InputAdornment, IconButton, Dialog, DialogContent, DialogTitle, CircularProgress, Alert } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { NoteLogo } from "../assets/noteLogo"
import { useNavigate, useLocation } from "react-router-dom"
import { Logo } from "../assets/Logo"
import signinImage from "../assets/signin-img.png"
import CustomTextField from "../components/customTextField"

const SignIn = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const passwordWasReset = !!location.state?.passwordReset

    // states for input fields
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [forgotOpen, setForgotOpen] = useState(false)
    const [forgotEmail, setForgotEmail] = useState("")
    const [forgotMsg, setForgotMsg] = useState("")
    const [forgotError, setForgotError] = useState("")
    const [forgotLoading, setForgotLoading] = useState(false)
    const [spotifyPrompt, setSpotifyPrompt] = useState(false)

    const handleClickShowPassword = () => setShowPassword((show) => !show)
    const handleMouseDownPassword = (event) => event.preventDefault()
    const handleMouseUpPassword = (event) => event.preventDefault()

    const handleForgotPassword = async () => {
        setForgotError("")
        setForgotMsg("")
        if (!forgotEmail) {
            setForgotError("Please enter your email.")
            return
        }
        setForgotLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: forgotEmail })
            setForgotMsg(res.data.msg)
        } catch (err) {
            const msg = err.response?.data?.msg || "Something went wrong. Please try again."
            if (msg === "No account with that email was found.") {
                setSpotifyPrompt(true)
            } else {
                setForgotError(msg)
            }
        } finally {
            setForgotLoading(false)
        }
    }

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
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password
            }, { withCredentials: true })

            if (response.data.spotifyAccessToken) {
                localStorage.setItem('spotify_access_token', response.data.spotifyAccessToken)
                localStorage.setItem('spotify_refresh_token', response.data.spotifyRefreshToken)
            }

            if (window.PasswordCredential) {
                const cred = new window.PasswordCredential({ id: email, password })
                await navigator.credentials.store(cred)
            }

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
        <Box sx={{ position: "relative", minHeight: "100vh", background: 'linear-gradient(44deg, rgba(255, 191, 105, 0.3), rgba(255, 255, 255, 1) 70.71%)', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
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
            <Stack direction="row" alignItems="stretch" sx={{ minHeight: "100vh" }}>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: { sm: '0 0 40%', md: '0 0 48%' }, p: '1.5rem', boxSizing: 'border-box' }}>
                    <img
                        src={signinImage}
                        alt="signin image"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "1rem",
                            display: "block",
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pl: { xs: 2, sm: 4, md: 6, lg: 10 }, pr: { xs: 3, sm: 7, md: 10, lg: 14 }, py: { xs: 3, md: 4 }, minWidth: 0 }}>
                <Stack
                    component="form"
                    onSubmit={(e) => { e.preventDefault(); handleSignIn() }}
                    direction="column"
                    spacing={{ xs: 2, md: 3 }}
                    sx={{ width: '100%' }}
                >
                    {passwordWasReset && (
                        <Alert severity="success" sx={{ borderRadius: '12px' }}>
                            Password updated! Please log in with your new password.
                        </Alert>
                    )}
                    <Typography
                        fontSize={{ xs: '22px', sm: '32px', md: '38px', lg: '44px' }}
                        sx={{ fontFamily: "'Tinos', serif", fontWeight: 700, color: '#EF233C' }}
                    >
                        Welcome Back!</Typography>
                    <NoteLogo />
                    <Typography fontSize={{ xs: '18px', sm: '24px', md: '28px', lg: '32px' }} fontWeight={700}>Log In</Typography>
                    <CustomTextField
                        id="outlined-basic email"
                        label="Spotify email"
                        variant="outlined"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!emailError}
                        helperText={emailError}
                        sx={{
                            width: '100%',
                            '& .MuiInputBase-root': { fontSize: { md: '15px', lg: '17px' } },
                            '& .MuiInputLabel-root': { fontSize: { md: '15px', lg: '17px' } },
                            '& .MuiOutlinedInput-root': { height: { lg: '54px' } },
                        }}
                    />
                    <CustomTextField
                        id="outlined-basic password"
                        label="Password"
                        variant="outlined"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        type={showPassword ? "text" : "password"}
                        sx={{
                            width: '100%',
                            '& .MuiInputBase-root': { fontSize: { md: '15px', lg: '17px' } },
                            '& .MuiInputLabel-root': { fontSize: { md: '15px', lg: '17px' } },
                            '& .MuiOutlinedInput-root': { height: { lg: '54px' } },
                        }}
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
                    {!passwordWasReset && (
                        <Box sx={{ textAlign: 'right' }}>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotMsg(""); setForgotError(""); setSpotifyPrompt(false) }}
                                sx={{ color: '#EF233C', textTransform: 'none', fontSize: { xs: '14px', lg: '17px' }, p: 0 }}
                            >
                                Forgot password?
                            </Button>
                        </Box>
                    )}
                    {error && <Typography color="error" sx={{ whiteSpace: 'pre-line', fontSize: { lg: '17px' } }}>{error}</Typography>}
                    <Button
                        type="submit"
                        variant="contained"
                        color="basic"
                        sx={{
                            width: '100%',
                            height: { xs: '48px', md: '52px', lg: '58px' },
                            color: '#0D1B2A',
                            fontSize: { xs: '18px', sm: '20px', md: '20px', lg: '22px' },
                            borderRadius: '36px',
                            boxShadow: '-8px 8px 0 #EF233C',
                            textTransform: "none",
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >Log In</Button>
                </Stack>
                </Box>
            </Stack>

            {/* Forgot Password Dialog — hidden after a successful reset */}
            {!passwordWasReset && (
                <Dialog
                    open={forgotOpen}
                    onClose={() => setForgotOpen(false)}
                    PaperProps={{ sx: { borderRadius: '24px', p: 1, width: { xs: '90vw', sm: '420px' } } }}
                >
                    <DialogTitle sx={{ fontFamily: "'Tinos', serif", fontWeight: 700, color: '#EF233C', fontSize: '24px' }}>
                        Reset your password
                    </DialogTitle>
                    <DialogContent>
                        {spotifyPrompt ? (
                            <Stack spacing={2}>
                                <Typography sx={{ color: '#555', fontSize: '14px' }}>
                                    No account found for <strong>{forgotEmail}</strong>. Please sign up using your Spotify account.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="mainRed"
                                    href={`${import.meta.env.VITE_API_URL}/auth/spotify/login`}
                                    sx={{
                                        color: 'white',
                                        borderRadius: '36px',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        height: '48px',
                                        boxShadow: 0,
                                    }}
                                >
                                    Sign up with Spotify
                                </Button>
                            </Stack>
                        ) : forgotMsg ? (
                            <Typography sx={{ color: 'green', fontSize: '14px' }}>{forgotMsg}</Typography>
                        ) : (
                            <Stack spacing={2}>
                                <Typography sx={{ mb: 1, color: '#555', fontSize: '14px' }}>
                                    Enter your account email and we'll send you a link to reset your password.
                                </Typography>
                                <CustomTextField
                                    label="Email"
                                    variant="outlined"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    error={!!forgotError}
                                    helperText={forgotError}
                                    sx={{ width: '100%' }}
                                />
                                <Button
                                    variant="contained"
                                    color="mainRed"
                                    onClick={handleForgotPassword}
                                    disabled={forgotLoading}
                                    sx={{
                                        color: 'white',
                                        borderRadius: '36px',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        height: '48px',
                                        boxShadow: 0,
                                    }}
                                >
                                    {forgotLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Send reset link'}
                                </Button>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    )
}

export default SignIn
