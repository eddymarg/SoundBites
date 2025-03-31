import { useState } from "react";
import { Box, OutlinedInput, Typography } from "@mui/material"
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
    'Rock',
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

const filterBar = () => {
    const [genreFilter, setGenreFilter] = useState([])
    const [distanceFilter, setDistanceFilter] = useState([])

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

    return (
        <div style={{ marginLeft: '0.5rem'}}>
            <FormControl sx={{ m: 1, width: 140}}>
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
                    sx={{ height: 40, display: "flex", alignItems: "center", marginTop: '0.1rem', backgroundColor: '#FFF4E693', borderRadius: '20px'}}
                >
                    {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                        <Checkbox checked={genreFilter.includes(genre)} />
                        <ListItemText primary={genre} />
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 175}}>
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
                    sx={{ height: 40, display: "flex", alignItems: "center", marginTop: '0.1rem', backgroundColor: '#FFF4E693', borderRadius: '20px'}}
                >
                    {distances.map((distance) => (
                        <MenuItem key={distance} value={distance}>
                        <Checkbox checked={distanceFilter.includes(distance)} />
                        <ListItemText primary={distance} />
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )
}

export default filterBar