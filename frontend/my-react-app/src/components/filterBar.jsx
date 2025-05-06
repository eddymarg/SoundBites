// Styling and main parts of the filter bar

import { useState } from "react";
import { Box, Chip, OutlinedInput, Typography, Slider } from "@mui/material"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const genres = [
    'Country',
    'Rock',
    'Soul',
    'Dance',
    'New-age',
    'Electronic',
    'Pop',
    'Hip-hop',
    'Blues',
    'R&B',
    'Folk',
    'Latin',
    'Jazz',
    'Classical',
    'Contemporary',
    'Reggae',
    'Funk'
]

const distances = [
    { label: '0 - 1 mi', range: [0, 1]},
    { label: '1 - 3 mi', range: [1, 3]},
    { label: '3 - 5 mi', range: [3, 5]},
    { label: '5 - 10 mi', range: [5, 10]},
    { label: '10 - 15 mi', range: [10, 15]},
]

const marks = [
    { value: 0, label: "$"},
    { value: 1, label: "$$"},
    { value: 2, label: "$$$"},
    { value: 3, label: "$$$$"},
]

const filterBar = ({ genreFilter, setGenreFilter, distanceFilter, setDistanceFilter, price, setPrice }) => {
    const handleGenreChange = (event) => {
        const {
            target: { value },
        } = event
        const newGenres = typeof value === 'string' ? value.split(',') : value
        
        if (newGenres.length > genreFilter.length) {
            console.log('Genres added:', newGenres.filter((genre) => !genreFilter.includes(genre)))
        } else if (newGenres.length < genreFilter.length){
            console.log('Genres removed:', genreFilter.filter((genre) => !newGenres.includes(genre)))
        } else {
            console.log('Genres changed:', newGenres)
        }
        setGenreFilter(newGenres)
    }

    const handleDistanceChange = (event) => {
        const {
            target: { value },
        } = event
        const newDistances = typeof value === 'string' ? value.split(',') : value

        const selectedRanges = newDistances.map(label => {
            const selected = distances.find(d => d.label === label)
            return selected ? selected.range : null
        }).filter(range => range !== null)

        setDistanceFilter(selectedRanges)
    }

    const handlePriceChange = (event, newValue) => {
        console.log('Price changed:', newValue)
        setPrice(newValue)
    }

    return (
        <Box 
            sx={{ 
                display: "flex",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "600px",
                padding: "0.5rem"
            }}
        >
            <FormControl sx={{ flex: "1 1 140", minWidth: "120px", marginLeft: "0.5rem"}}>
                <Select
                    multiple
                    displayEmpty
                    value={genreFilter}
                    onChange={handleGenreChange}
                    input={<OutlinedInput />}
                    inputProps={{ 'aria-label': 'Genre'}}
                    renderValue={(selected) => {
                        if(selected.length === 0) {
                            return <Typography>Genre</Typography>
                        }
                        return (
                            selected.join(', ')
                        )
                    }}
                    MenuProps={MenuProps}
                    sx={{ 
                        height: 40, 
                        display: "flex", 
                        alignItems: "center", 
                        marginTop: '0.1rem', 
                        backgroundColor: '#FFF4E693', 
                        borderRadius: '20px'
                    }}
                >
                    {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                        <Checkbox checked={genreFilter.includes(genre)} />
                        <ListItemText primary={genre} />
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ flex: "1 1 175", minWidth: "140px", marginLeft: "0.5rem" }}>
                <Select
                    multiple
                    displayEmpty
                    value={distanceFilter.map(range => distances.find(d => d.range === range)?.label || '')}
                    onChange={handleDistanceChange}
                    input={<OutlinedInput/>}
                    inputProps={{ 'aria-label': 'Distance' }}
                    renderValue={(selected) => {
                        if(selected.length === 0) {
                            return <Typography>Distance</Typography>
                        }
                        return selected.join(', ')
                    }}
                    MenuProps={MenuProps}
                    sx={{ 
                        height: 40, 
                        display: "flex", 
                        alignItems: "center", 
                        marginTop: '0.1rem', 
                        backgroundColor: '#FFF4E693', 
                        borderRadius: '20px',
                    }}
                >
                    {distances.map((distance) => (
                        <MenuItem key={distance.label} value={distance.label}>
                        <Checkbox checked={distanceFilter.includes(distance.range)} />
                        <ListItemText primary={distance.label} />
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box 
                sx={{ 
                    flex: "1 1 20%", 
                    minWidth: "130px", 
                    textAlign: "center",
                    marginLeft: "4rem", 
                }}
            >
                <Slider
                    value={price}
                    onChange={handlePriceChange}
                    step={1}
                    marks={marks}
                    min={0}
                    max={3}
                    sx={{
                        color: "#FFBF69",
                        height: 8,
                        "& .MuiSlider-thumb": {
                            width: 24,
                            height: 24,
                            backgroundColor: "#FFBF69",
                            border: "2px solid white",
                            "&:focus, &:hover": { boxShadow: "0px 0px 5px #FFBF69"},
                        },
                        "& .MuiSlider-track": {
                            height: 4,
                            backgroundColor: "#FFBF69",
                        },
                        "& .MuiSlider-rail": {
                            height: 4,
                            backgroundColor: "#FFBF69",
                        },
                        "& .MuiSlider-mark": {
                            backgroundColor: "#FCE8C8",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            transform: "translate(-50%, -50%)",
                        },
                        "& .MuiSlider-markActive": {
                            backgroundColor: "orange",
                        },
                        "& .MuiSlider-markLabel": {
                            fontSize: 16,
                            fontFamily: "Tinos, Serif",
                            fontWeight: "bold",
                            color: "#0E182A",
                        },
                    }}
                />
            </Box>
        </Box>
    )
}

export default filterBar