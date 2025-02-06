import { styled, TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"

const CustomTextField = styled(TextField)(({ theme })=> ({
    '& .MuiInputLabel-root': {
        color: '#0D1B2A',
        '&.Mui-focused': {
            color: '#0D1B2A',
        },
    },
    '& .MuiOutlinedInput-root': {
        color: '#0D1B2A',
        '& fieldset': { 
            borderColor: '#EF233C',
            borderRadius: '36px',
        },
        '&:hover fieldset': {borderColor: '#EF233C70'},
        '&.Mui-focused fieldset': { borderColor: '#EF233C60'},
    },
    input: {
        color: '#0D1B2A',
    },
}))

export default CustomTextField