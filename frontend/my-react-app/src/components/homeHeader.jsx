import React from "react"
import { Link } from "react-router-dom"
// import { Logo } from '../assets/title_logo.svg?react'

const HomeHeader = () => {
    return (
        <div>
            <nav>
                {/* <Logo className="h-12 w-12"/> */}
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    <li>
                        <Link to='/about' style={{textDecoration: "underlined"}}>About</Link>
                    </li>
                    <li>
                        <Link to='/signup'>
                        Sign Up</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default HomeHeader