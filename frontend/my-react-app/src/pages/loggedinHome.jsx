import { Typography } from "@mui/material"
import LoggedInHeader from "../components/loggedinHeader"

const userHome = () => {
    return(
        <div>
            <LoggedInHeader/>
            <Typography>Logged in!</Typography>
        </div>
    )
}

export default userHome