import { PhoneOutlined } from '@ant-design/icons'

interface iProps {
  remoteName: string
  remoteId: string
  answer: () => void
  denial: () => void
}

const Ringed = (props: iProps) => {
  const { remoteName, remoteId, answer, denial } = props

  return (
    <div className="p-2 h-64 w-80 flex flex-col justify-center items-center border-solid border-2 border-gray-200 rounded-lg bg-gray-900/80">
      <div className="text-4xl">{remoteName || remoteId}</div>
      <div className="w-32 h-32 flex justify-center items-center">
        <div className="relative w-full h-full flex justify-center items-center">
          <div
            className="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-0 animate-[explode_1.5s_ease-in-out_infinite]"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-0 animate-[explode_1.5s_ease-in-out_infinite]"
            style={{ animationDelay: '0.3s' }}
          ></div>
          <div
            className="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-0 animate-[explode_1.5s_ease-in-out_infinite]"
            style={{ animationDelay: '0.6s' }}
          ></div>
        </div>
      </div>
      <div className="flex gap-10">
        <PhoneOutlined
          className="w-12 h-12 flex justify-center items-center bg-red-500 rounded-2xl border-2 border-gray-200 border-solid cursor-pointer"
          style={{ fontSize: '24px' }}
          onClick={denial}
        />
        <PhoneOutlined
          className="w-12 h-12 flex justify-center items-center bg-green-500 rounded-2xl border-2 border-gray-200 border-solid cursor-pointer"
          style={{ fontSize: '24px' }}
          onClick={answer}
        />
      </div>
    </div>
  )
}

export default Ringed
