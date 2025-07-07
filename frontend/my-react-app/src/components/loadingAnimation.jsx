import { useEffect, useState } from 'react'
import FryingPan1 from '../assets/fryingPan/fryingPan1'
import FryingPan2 from '../assets/fryingPan/fryingPan2'
import FryingPan3 from '../assets/fryingPan/fryingPan3'
import FryingPan4 from '../assets/fryingPan/fryingPan4'
import FryingPan5 from '../assets/fryingPan/fryingPan5'
import FryingPan6 from '../assets/fryingPan/fryingPan6'
import FryingPan7 from '../assets/fryingPan/fryingPan7'
import FryingPan8 from '../assets/fryingPan/fryingPan8'
import FryingPan9 from '../assets/fryingPan/fryingPan9'
import FryingPan10 from '../assets/fryingPan/fryingPan10'
import FryingPan11 from '../assets/fryingPan/fryingPan11'
import FryingPan12 from '../assets/fryingPan/fryingPan12'
import FryingPan13 from '../assets/fryingPan/fryingPan13'
import FryingPan14 from '../assets/fryingPan/fryingPan14'
import FryingPan15 from '../assets/fryingPan/fryingPan15'

const frames = [
     <FryingPan1 />,
  <FryingPan2 />,
  <FryingPan3 />,
  <FryingPan4 />,
  <FryingPan5 />,
  <FryingPan6 />,
  <FryingPan7 />,
  <FryingPan8 />,
  <FryingPan9 />,
  <FryingPan10 />,
  <FryingPan11 />,
  <FryingPan12 />,
  <FryingPan13 />,
  <FryingPan14 />,
  <FryingPan15 />,
  <FryingPan14 />,
  <FryingPan13 />,
  <FryingPan12 />,
  <FryingPan11 />,
  <FryingPan10 />,
  <FryingPan9 />,
  <FryingPan8 />,
  <FryingPan7 />,
  <FryingPan6 />,
  <FryingPan5 />,
  <FryingPan4 />,
  <FryingPan3 />,
  <FryingPan2 />,
]

const LoadingAnimation = () => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % frames.length)
        }, 100)

        return () => clearInterval(interval)
    }, [])

    return <div>{frames[index]}</div>
}

export default LoadingAnimation