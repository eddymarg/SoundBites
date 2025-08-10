import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material"
import React from "react"
import { useState } from "react"

const AddPassword = ({ open, onClose, spotifyId }) => {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            setError("Please fill in both fields.")
            return
        }

        if (password != confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError("")
        
        try {
            const res = await fetch("http://localhost:5001/set-spotify-user-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spotifyId, password})
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                }, 1500)
            } else {
                setError(data.error || "Something went wrong")
            }
        } catch (err) {
            console.error("Password set error:", err)
            setError("Network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle 
                sx={{ 
                    fontFamily: "'Tinos', Serif", 
                    fontWeight: "700",
                    textAlign: 'center',
                    fontSize: '1.5rem',
                }}
            >
                Your table's almost ready! 🍽️<br></br> Just add a password to complete the dish.
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center' }}>That way, you can come back for seconds without going through the whole 'new guest' process.</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <Typography color="error" sx={{ mt: 1}}>{error}</Typography>}
                {success && <Typography color="primary" sx={{ mt: 1 }}>Password saved!</Typography>}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', padding: '1rem' }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading} 
                    sx={{
                        color: '#0D1B2A',
                        border: '2px solid #EF233C',
                        borderRadius: '36px',
                        '&:hover': {
                            backgroundColor: '#EF233C70'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    sx={{
                        color: 'white',
                        backgroundColor: '#EF233C',
                        border: '2px solid #EF233C',
                        borderRadius: '36px',
                        '&:hover': {
                            backgroundColor: '#EF233C70',
                        }
                    }}
                >
                    {loading ? "Saving..." : "Save Password"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddPassword