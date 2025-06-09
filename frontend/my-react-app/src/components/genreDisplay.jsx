// Displays the top 3 genres as buttons
import { useState, useEffect } from "react";
import { Button, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear';
import { motion } from "motion/react"

const GenreDisplay = ({ topGenres }) => {
    const [newGenres, setNewGenres] = useState([])
    const [genreToDelete, setGenreToDelete] = useState(null)
    const [open, setOpen] = useState(false)
    const [lastDeletedGenre, setLastDeletedGenre] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)

    useEffect(() => {
        if(topGenres) setNewGenres(topGenres)
    }, [topGenres])


    const handleOpenDialog = (genre) => {
        setGenreToDelete(genre)
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setGenreToDelete(null)
        setOpen(false)
    }

    const handleDeleteGenre = (genreToRemove) => {
        setLastDeletedGenre(genreToRemove)
        setNewGenres(prev => prev.filter(g => g !== genreToRemove))
        handleCloseDialog()
        setSnackbarOpen(true)
    }

    const handleUndo = () => {
        if (lastDeletedGenre) {
            setNewGenres(prev => [...prev, lastDeletedGenre])
            setLastDeletedGenre(null)
        }
        setSnackbarOpen(false)
    }

    return (
    <>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {newGenres.map((genre, index) => (
                <motion.div
                    key={genre}
                    initial={{ y: -100, opacity: 0}}
                    animate={{ y: 0, opacity: 1}}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.1,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderRadius: '50px',
                            textTransform: 'capitalize',
                            fontSize: '15px',
                            fontWeight: '500',
                            padding: '0.8rem 1rem',
                            borderColor: '#EF233C95',
                            color: 'white',
                            backgroundColor: '#EF233C',
                        }}
                    >
                        {genre}
                        <IconButton onClick={() => handleOpenDialog(genre)}>
                            <ClearIcon 
                                sx={{ 
                                    fontSize: 'large',
                                    fontWeight: '700',
                                    color: 'white',
                                }}
                            />
                        </IconButton>
                    </Box>
                </motion.div>
            ))}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} sx={{ padding: '5rem', textAlign: "center", background: '#FFBF6970' }}>
            <DialogContent>
                Are you sure you want to remove <strong>{genreToDelete}</strong> from your top genres?
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
                <Button 
                    variant="contained" 
                    onClick={handleCloseDialog}
                    sx={{
                        backgroundColor: "#EF233C",
                    }}
                >
                    Cancel
                </Button>
                <Button variant="outlined" onClick={() => handleDeleteGenre(genreToDelete)} sx={{
                    color: "#EF233C",
                    borderColor: "#EF233C",
                }} >Delete</Button>
            </DialogActions>
        </Dialog>

        {/* UNDO DELETE */}
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            message={`Removed "${lastDeletedGenre}"`}
            action={
                <Button color="primary" size="small" onClick={handleUndo}>
                    UNDO
                </Button>
            }
        />
    </>
    )
}


export default GenreDisplay