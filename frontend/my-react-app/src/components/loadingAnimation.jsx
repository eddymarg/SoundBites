import { useEffect, useRef, useState } from 'react'
import Frying1 from '../assets/LoadingAnimation/Frying-1.svg?react'
import Frying2 from '../assets/LoadingAnimation/Frying-2.svg?react'
import Frying3 from '../assets/LoadingAnimation/Frying-3.svg?react'
import Frying4 from '../assets/LoadingAnimation/Frying-4.svg?react'
import Frying5 from '../assets/LoadingAnimation/Frying-5.svg?react'
import Frying6 from '../assets/LoadingAnimation/Frying-6.svg?react'
import Frying7 from '../assets/LoadingAnimation/Frying-7.svg?react'
import Frying8 from '../assets/LoadingAnimation/Frying-8.svg?react'

const FRAMES = [Frying1, Frying2, Frying3, Frying4, Frying5, Frying6, Frying7, Frying8]
const FRAME_MS = 130

const LoadingAnimation = () => {
    const [index, setIndex] = useState(0)
    const indexRef = useRef(0)

    useEffect(() => {
        const id = setInterval(() => {
            indexRef.current = (indexRef.current + 1) % FRAMES.length
            setIndex(indexRef.current)
        }, FRAME_MS)
        return () => clearInterval(id)
    }, [])

    const Frame = FRAMES[index]
    return (
        <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
            <Frame width="100%" height="100%" style={{ display: 'block' }} />
        </div>
    )
}

export default LoadingAnimation
