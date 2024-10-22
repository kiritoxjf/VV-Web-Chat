import { useState } from 'react'
import styles from './index.module.scss'

interface iProps {
  lLabel: string
  lComponent: JSX.Element
  rLabel: string
  rComponent: JSX.Element
}

const Toggle = (props: iProps) => {
  const { lLabel, lComponent, rLabel, rComponent } = props

  const [checked, setChecked] = useState(false)

  return (
    <div className="relative flex flex-col justify-center items-center">
      <label className="flex flex-col justify-center items-center">
        <input
          type="checkbox"
          className={`${styles.toggle} opacity-0 h-0 w-0`}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span
          className={`${styles.slider} box-border absolute rounded-md bg-white border-2 border-blue-700 shadow-1 shadow-blue-400 transition-all duration-300 w-12 h-6 top-0
          before:absolute before:content-[''] before:w-6 before:h-6 before:rounded-lg before:bg-white before:-left-1 before:-top-1 before:border-2 before:border-blue-700 before:shadow-1 before:shadow-blue-400 before:transition-all before:duration-300`}
        ></span>
        <span
          className={`
          ${styles.label}
          relative w-14 h-6 cursor-pointer
          before:absolute before:content-[var(--label-before-content)] before:top-0 before:-left-full  before:underline before:decoration-solid before:decoration-2 before:underline-offset-2 before:text-gray-200 before:text-2xl
          after:absolute after:content-[var(--label-after-content)] after:top-0 after:-right-full  after:decoration-solid after:decoration-2 after:underline-offset-2 after:text-gray-200 after:text-2xl`}
          style={
            {
              '--label-before-content': `"${lLabel}"`,
              '--label-after-content': `"${rLabel}"`
            } as React.CSSProperties & { [key: string]: string }
          }
        ></span>
      </label>
      <div className="relative flex flex-col justify-center items-center">
        <div className={`${styles.lComponent} ${checked ? styles.hidden : ''} mt-6`}>
          {lComponent}
        </div>
        <div className={`${styles.rComponent} ${checked ? '' : styles.hidden} absolute top-6`}>
          {rComponent}
        </div>
      </div>
    </div>
  )
}

export default Toggle
