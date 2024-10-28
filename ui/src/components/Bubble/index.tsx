import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './index.module.scss'

interface iProps {
  child: JSX.Element
  bubbleColor?: string
}

const Bubble = ({ child, bubbleColor = '#fff' }: iProps) => {
  const childRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState<number>(0)

  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => i)
  }, [count])

  useEffect(() => {
    if (childRef.current) {
      const { width, height } = childRef.current.getBoundingClientRect()

      setCount(Math.floor((width + height) / 32))
    }
  }, [])
  return (
    <div className={styles.bubble} style={{ '--bubble-color': bubbleColor, '--bubble-count': count } as React.CSSProperties}>
      {/* Bubble Container */}
      <div className={styles.bubble__container}>
        {bubbles.map((_, i) => (
          <div key={i} className={`${styles.bubble__item}${i}`}></div>
        ))}
      </div>
      <div className={`${styles.child}`} ref={childRef}>
        {child}
      </div>
    </div>
  )
}

export default Bubble
