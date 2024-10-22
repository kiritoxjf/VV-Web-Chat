import { useEffect, useRef } from 'react'

interface iProps {
  child: JSX.Element
}

const Colorful = (props: iProps) => {
  const { child } = props

  const colorfulRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    colorfulRef.current?.style.setProperty(
      '--length',
      String(
        Math.sqrt(
          Math.pow(colorfulRef.current.clientWidth, 2) +
            Math.pow(colorfulRef.current.clientHeight, 2)
        ) * 1.2
      )
    )
  }, [])

  return (
    <div
      className={`
        relative bg-gray-800 flex place-content-center place-items-center overflow-hidden rounded-lg
        before:absolute before:content-[''] before:w-full before:h-6 before:bg-gradient-to-r before:from-blue-700 before:to-red-600 before:animate-[spin_3s_linear_infinite]
        after:absolute after:content-[''] after:bg-gray-800 after:inset-1 after:rounded-lg
      `}
      ref={colorfulRef}
    >
      <div className="z-10 scale-95">{child}</div>
    </div>
  )
}

export default Colorful
