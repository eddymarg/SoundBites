// Displays the top 3 genres as buttons
import { useState } from "react";
import { Box, IconButton, Dialog, DialogContent, DialogActions, Button, Snackbar, Portal, Tooltip } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { motion } from "framer-motion"

const GenreDisplay = ({ topGenres, allGenres = [], setTopGenres }) => {
    const [genreToDelete, setGenreToDelete] = useState(null)
    const [open, setOpen] = useState(false)
    const [lastDeletedGenre, setLastDeletedGenre] = useState(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)


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
        setTopGenres(topGenres.filter(g => g !== genreToRemove))
        handleCloseDialog()
        setSnackbarOpen(true)
    }

    const handleUndo = () => {
        if (lastDeletedGenre) {
            setTopGenres([...topGenres, lastDeletedGenre])
            setLastDeletedGenre(null)
        }
        setSnackbarOpen(false)
    }

    const [spinCount, setSpinCount] = useState(0)

    const handleShuffle = () => {
        setSpinCount(c => c + 1)
        const pool = allGenres.length >= 3 ? allGenres : topGenres
        const different = pool.filter(g => !topGenres.includes(g))
        const source = different.length >= 3 ? different : pool
        const shuffled = [...source].sort(() => Math.random() - 0.5)
        setTopGenres(shuffled.slice(0, 3))
    }

    return (
    <>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {topGenres.map((genre, index) => (
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
                            gap: { xs: 0.5, md: 1 },
                            borderRadius: '50px',
                            textTransform: 'capitalize',
                            fontSize: { xs: '12px', md: '15px' },
                            fontWeight: '500',
                            padding: { xs: '0.3rem 0.2rem 0.3rem 0.8rem', md: '0.8rem 0.5rem 0.8rem 1rem' },
                            borderColor: '#EF233C95',
                            color: 'white',
                            backgroundColor: '#EF233C',
                        }}
                    >
                        {genre}
                        <IconButton onClick={() => handleOpenDialog(genre)} sx={{ p: { xs: '2px', md: '8px' } }}>
                            <ClearIcon
                                sx={{
                                    fontSize: { xs: '16px', md: '24px' },
                                    fontWeight: '700',
                                    color: 'white',
                                }}
                            />
                        </IconButton>
                    </Box>
                </motion.div>
            ))}
            {allGenres.length > 3 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.35 }}
                >
                    <Tooltip title="Shuffle genres" placement="top" arrow>
                        <IconButton
                            onClick={handleShuffle}
                            size="small"
                            sx={{
                                color: '#EF233C',
                                border: '1.5px solid #EF233C',
                                borderRadius: '50%',
                                p: { xs: '5px', md: '7px' },
                                background: 'transparent',
                                transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    background: '#EF233C',
                                    color: 'white',
                                    boxShadow: '0 0 0 3px #EF233C30',
                                },
                            }}
                        >
                            <motion.span
                                key={spinCount}
                                animate={{ rotate: spinCount > 0 ? 360 : 0 }}
                                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                style={{ display: 'flex' }}
                            >
                                <ShuffleIcon sx={{ fontSize: { xs: '16px', md: '20px' } }} />
                            </motion.span>
                        </IconButton>
                    </Tooltip>
                </motion.div>
            )}
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
        <Portal>
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
        </Portal>
    </>
    )
}


export default GenreDisplay