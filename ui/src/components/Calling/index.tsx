import { useState } from 'react'
import styles from './index.module.scss'
import AudioSvg from '@/assets/svg/audio.svg?react'
import { PhoneOutlined } from '@ant-design/icons'

interface iProps {
  remoteName: string
  audioRef: React.RefObject<HTMLAudioElement>
  outputVol: string
  hangup: (ed: boolean) => void
}

const Calling = (props: iProps) => {
  const { remoteName, audioRef, outputVol, hangup } = props

  const [listen, setListen] = useState(true)

  return (
    <div className="p-2 h-64 w-80 flex flex-col items-center border-solid border-2 border-gray-200 rounded-lg gap-2 bg-gray-900/80">
      <div className="text-4xl" title="点击修改名字">
        {remoteName}
      </div>
      <div className="w-32 h-32 flex justify-center items-center">
        {listen && (
          <AudioSvg
            className={`${styles.microphone} w-24 h-24 rounded-full border-2 border-gray-200 border-solid cursor-pointer`}
            style={{ '--x': outputVol }}
            onClick={() => {
              audioRef.current?.pause()
              setListen(false)
            }}
          />
        )}
        {!listen && (
          <AudioSvg
            className={`w-24 h-24 rounded-full border-2 border-gray-200 border-solid cursor-pointer bg-red-800`}
            onClick={() => {
              audioRef.current?.play()
              setListen(true)
            }}
          />
        )}
      </div>
      <div className="flex w-full justify-center">
        <PhoneOutlined
          className="w-12 h-12 flex justify-center items-center bg-red-500 rounded-2xl border-2 border-gray-200 border-solid cursor-pointer"
          style={{ fontSize: '24px' }}
          onClick={() => {
            hangup(false)
          }}
        />
      </div>
    </div>
  )
}

export default Calling
