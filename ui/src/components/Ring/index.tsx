import { PhoneOutlined } from '@ant-design/icons'

interface iProps {
  remoteId: string
  cancel: () => void
}

const Ringed = (props: iProps) => {
  const { remoteId, cancel } = props

  return (
    <div
      className={`relative flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-bl from-red-400 to-blue-900`}
    >
      <div
        className={`group relative flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-br from-red-400 to-blue-900 
          before:absolute before:content-[''] before:w-full before:h-full before:rounded-full before:shadow-green-500 before:shadow-round before:animate-little-ping`}
      >
        <div className="absolute flex flex-col justify-center items-center gap-4 opacity-100 transition duration-500 ease-in-out group-hover:opacity-0 group-hover:scale-75">
          <span className="-mt-4 text-4xl text-center cursor-default transition">
            <p>{remoteId}</p>
            <p className="text-lg">呼叫中...</p>
          </span>
        </div>
        <div className="absolute flex justify-center items-center gap-8 opacity-0 transition duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-125">
          <PhoneOutlined
            className="w-12 h-12 flex justify-center items-center bg-red-500 rounded-2xl border-2 border-gray-200 border-solid cursor-pointer"
            style={{ fontSize: '24px' }}
            onClick={cancel}
          />
        </div>
      </div>
    </div>
  )
}

export default Ringed
