import { useStore } from '@/store/base'
import { Button } from 'antd'
import ReactSvg from '@/assets/react.svg?react'

function Home() {
  const counter = useStore((state) => state.counter)
  const increment = useStore((state) => state.increment)
  const decrement = useStore((state) => state.decrement)

  return (
    <div className="flex flex-col h-full w-full justify-center items-center gap-2 bg-black text-white">
      <ReactSvg className="animate-[spin_5s_linear_infinite] w-40 h-40" />
      <div className="text-3xl font-bold">{counter}</div>
      <div>
        <Button onClick={increment}>+1</Button>
        <Button onClick={decrement}>-1</Button>
      </div>
    </div>
  )
}

export default Home
