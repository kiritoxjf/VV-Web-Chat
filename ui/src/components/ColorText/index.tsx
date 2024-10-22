// // https://codepen.io/rachsmith/pen/oGEMbz
// // 以上动画形式的输入框
// // 需要使用gsap库

// import { useEffect, useRef, useState } from 'react'
// import styles from './index.module.scss'

// interface iProps {
//   text: string
//   duration?: number
// }

// const colors = [
//   { main: '#FBDB4A', shades: ['#FAE073', '#FCE790', '#FADD65', '#E4C650'] },
//   { main: '#F3934A', shades: ['#F7B989', '#F9CDAA', '#DD8644', '#F39C59'] },
//   { main: '#EB547D', shades: ['#EE7293', '#F191AB', '#D64D72', '#C04567'] },
//   { main: '#9F6AA7', shades: ['#B084B6', '#C19FC7', '#916198', '#82588A'] },
//   { main: '#5476B3', shades: ['#6382B9', '#829BC7', '#4D6CA3', '#3E5782'] },
//   { main: '#2BB19B', shades: ['#4DBFAD', '#73CDBF', '#27A18D', '#1F8171'] },
//   { main: '#70B984', shades: ['#7FBE90', '#98CBA6', '#68A87A', '#5E976E'] }
// ]

// const ColorText = ({ text, duration = 400 }: iProps) => {
//   const [letters, setLetters] = useState<string[]>([])

//   const svgRef = useRef<SVGSVGElement>(null)
//   const textRef = useRef<HTMLParagraphElement>(null)
//   const offscreenRef = useRef<HTMLParagraphElement>(null)

//   const addLetter = (index: number) => {
//     setTimeout(() => {
//       if (text.length === index) return
//       const label = text[index]
//       const letter = document.createElement('span')
//       letter.innerText = label ?? ''
//       letter.style.color = colors[index % colors.length].main
//       textRef.current?.appendChild(letter)

//       addLetter(index + 1)
//     }, duration)
//   }

//   const removeLetter = (node: HTMLElement) => {
//     textRef.current?.removeChild(node)
//   }



//   useEffect(() => {
//     setLetters([])
//     addLetter(0)
//   }, [])

//   return (
//     <div className={styles.colorText}>
//       <p ref={offscreenRef}></p>
//       <p className={styles.text} ref={textRef}></p>
//       <svg className={styles.svg} ref={svgRef}></svg>
//     </div>
//   )
// }

// export default ColorText
