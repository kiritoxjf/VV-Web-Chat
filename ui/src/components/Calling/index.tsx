import { useState } from 'react'
import { PhoneOutlined } from '@ant-design/icons'
import MicroPhoneSvg from '@/assets/svg/microphone.svg?react'

interface iProps {
  remoteName: string
  remoteAvatar: string
  audioRef: React.RefObject<HTMLAudioElement>
  outputVol: number
  hangup: (ed: boolean) => void
}

const Calling = (props: iProps) => {
  const { remoteName, remoteAvatar, audioRef, outputVol, hangup } = props

  const [listen, setListen] = useState(true)

  const mute = () => {
    setListen(false)
    audioRef.current?.pause()
  }

  const unmute = () => {
    setListen(true)
    audioRef.current?.play()
  }

  return (
    <div
      className={`relative flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-br from-red-400 to-blue-900 
      before:absolute before:content-[''] before:w-full before:h-full before:rounded-full ${outputVol > 10 ? 'before:shadow-green-500' : ''} ${listen ? '' : 'before:shadow-red-500'} before:shadow-2`}
    >
      <div className="group h-full w-full relative flex flex-col justify-center items-center rounded-full overflow-hidden">
        <div className="absolute flex flex-col justify-center items-center gap-4">
          <img
            className="w-32 h-32 rounded-full object-cover transition group-hover:-translate-y-40 duration-500 ease-in-out"
            src={
              remoteAvatar ||
              'https://images.wallpaperscraft.com/image/single/boy_smile_dog_1006791_240x320.jpg'
            }
            alt="头像"
          />
          <span className="-mt-4 text-4xl cursor-default transition group-hover:translate-y-40 duration-500 ease-in-out">
            {remoteName}
          </span>
        </div>
        <div className="absolute flex justify-center items-center gap-8">
          <PhoneOutlined
            className="w-16 h-16 flex justify-center items-center rounded-full text-4xl text-red-700 cursor-pointer hover:text-red-400 hover:bg-gray-500/40 transition -translate-x-40 group-hover:translate-x-0 duration-500 ease-in-out"
            onClick={() => {
              hangup(false)
            }}
          />
          <MicroPhoneSvg
            className={`w-10 h-10 ${listen ? 'text-green-700 hover:text-green-400' : 'text-red-700 hover:text-red-400'} cursor-pointer transition translate-x-40 group-hover:translate-x-0 duration-500 ease-in-out`}
            onClick={() => {
              listen ? mute() : unmute()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Calling
