import { post } from '@/scripts/axios'
import { useBaseStore } from '@/store/base'
import { Input, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const ws = useBaseStore((state) => state.ws)
  const id = useBaseStore((state) => state.id)
  const name = useBaseStore((state) => state.name)
  const avatar = useBaseStore((state) => state.avatar)
  const updateId = useBaseStore((state) => state.updateId)
  const updateRoom = useBaseStore((state) => state.updateRoom)

  const [roomId, setRoomId] = useState('')

  const navigate = useNavigate()
  const [messageApi, messageCtx] = message.useMessage()

  // 创建房间
  const create = () => {
    const json = {
      id: id
    }
    post<{ id: string }>('/api/room/create', json)
      .then((res) => {
        updateRoom(res.id)
        navigate('/room')
      })
      .catch((err) => {
        messageApi.error(err)
      })
  }

  // 加入房间
  const join = () => {
    const json = {
      id: id,
      name: name,
      avatar: avatar,
      roomId: roomId
    }
    post('/api/room/join', json)
      .then(() => {
        updateRoom(roomId)
        navigate('/room')
      })
      .catch((err) => {
        messageApi.error(err)
      })
  }

  useEffect(() => {
    if (ws) {
      ws.onmessage = (e) => {
        const json = JSON.parse(e.data)
        switch (json.key) {
          case 'register':
            updateId(json.id)
        }
      }
    }
  }, [ws])

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-white">
      {messageCtx}
      <div className="flex items-center gap-4 text-4xl">
        <div>
          <img
            className="w-12 h-12 rounded-lg object-cover"
            src={
              avatar ||
              'https://img0.pixhost.to/images/614/527153430_boy_smile_dog_1006791_240x320.jpg'
            }
            alt="头像"
          />
        </div>
        <div>{name}</div>
      </div>
      <Input
        classNames={{
          input: `w-60 border-x-0 border-t-0 border-solid border-2 ${roomId.length === 5 ? 'border-green-400' : 'border-gray-400'} rounded-none text-4xl text-center text-white font-own focus:border-e-0 hover:border-e-0 placeholder:text-white/30`
        }}
        variant="borderless"
        value={roomId}
        placeholder="房间号"
        onChange={(e) => {
          setRoomId(e.target.value)
        }}
        onPressEnter={() => {
          join()
        }}
      />
      <div className="flex phone:flex-col desktop:flex-row gap-8">
        <button
          className={`phone:w-64 desktop:w-40 text-2xl px-4 py-2 bg-gray-800/70 border border-white rounded-lg shadow-2 shadow-white active:shadow-0 active:translate-x-2 active:translate-y-2`}
          onClick={create}
        >
          创建房间
        </button>
        <button
          className={`phone:w-64 desktop:w-40 text-2xl px-4 py-2 bg-gray-800/70 border border-white rounded-lg shadow-2 shadow-white active:shadow-0 active:translate-x-2 active:translate-y-2`}
          onClick={join}
        >
          加入房间
        </button>
      </div>
    </div>
  )
}

export default Home
