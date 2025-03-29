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
    'Hip=hop',
    'Blues',
    'R&B',
    'Folk',
    'Latin',
    'Jazz',
    'Classical',
    'Contemporary',
    'Reggae',
    'Funk'
  ];

const filterBar = () => {
    const [genreFilter, setGenreFilter] = useState([])

    const handleChange = (event) => {
        const {
            target: { value },
        } = event
        setPersonName(
            typeof value === 'string' ? value.split(',') : value,
        )
    }

    return (
        <div>
            <FormControl sx={{ m: 1, width: 300}}>
                <InputLabel id="genre-selection">Genre</InputLabel>
                <Select
                    labelId="genre-selection"
                    id="genre"
                    multiple
                    value={genreFilter}
                    onChange={handleChange}
                    input={<OutlinedInput label="Tag" />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                        <Checkbox checked={genreFilter.includes(genre)} />
                        <ListItemText primary={genre} />
                    </MenuItem>

                    ))}
                </Select>
            </FormControl>
        </div>
    )
}

export default filterBar