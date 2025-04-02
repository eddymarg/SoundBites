import { useState } from "react";
import { Box, OutlinedInput, Typography, Slider } from "@mui/material"
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
    '0 - 1 mi',
    '1 - 3 mi',
    '3 - 5 mi',
    '5 - 10 mi',
    '10 - 15 mi',
]

const marks = [
    { value: 0, label: "$"},
    { value: 25, label: "$$"},
    { value: 50, label: "$$$"},
    { value: 75, label: "$$$$"},
]

const filterBar = ({ genreFilter, setGenreFilter, distanceFilter, setDistanceFilter, price, setPrice }) => {
    const handleGenreChange = (event) => {
        const {
            target: { value },
        } = event
        setGenreFilter(
            typeof value === 'string' ? value.split(',') : value,
        )
    }

    const handleDistanceChange = (event) => {
        const {
            target: { value },
        } = event
        setDistanceFilter(
            typeof value === 'string' ? value.split(',') : value,
        )
    }

    const handlePriceChange = (event, newValue) => {
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
                <InputLabel id="genre-selection" shrink={false} sx={{ top: "0px", transform: "translate(14px, 8px) scale(1)"}}>Genre</InputLabel>
                <Select
                    labelId="genre-selection"
                    id="genre"
                    multiple
                    value={genreFilter}
                    onChange={handleGenreChange}
                    input={<OutlinedInput label="Tag" />}
                    renderValue={(selected) => selected.join(', ')}
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
                <InputLabel id="distance-selection" sx={{ top: "0px", transform: "translate(14px, 8px) scale(1)"}}>Distance</InputLabel>
                <Select
                    labelId="distance-selection"
                    id="distance"
                    multiple
                    value={distanceFilter}
                    onChange={handleDistanceChange}
                    input={<OutlinedInput label="Tag" />}
                    renderValue={(selected) => selected.join(', ')}
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
                        <MenuItem key={distance} value={distance}>
                        <Checkbox checked={distanceFilter.includes(distance)} />
                        <ListItemText primary={distance} />
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
                    step={null}
                    marks={marks}
                    min={0}
                    max={75}
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