import Colorful from '@/components/Colorful'
import { useBaseStore } from '@/store/base'
import { createClickText } from '@/scripts/click_text'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Room = () => {
  const room = useBaseStore((state) => state.room)

  const navigate = useNavigate()

  useEffect(() => {
    if(!room) {
      navigate('/')
    }
  }, [])

  // handleClickCopy 点击复制
  const handleClickCopy = (event: React.MouseEvent<HTMLDivElement>) => {
    navigator.clipboard
      .writeText(room)
      .then(() => {
        createClickText(event.pageX, event.pageY, '复制成功')
      })
      .catch(() => {
        createClickText(event.pageX, event.pageY, '浏览器不支持点击复制')
      })
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex my-2 justify-center items-center gap-2 text-white">
        <div className="cursor-default">房间号：</div>
        <Colorful
          child={
            <div className="group relative cursor-pointer" onClick={handleClickCopy}>
              <div className="relative text-4xl group-hover:opacity-10">{room}</div>
              <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                点击复制
              </div>
            </div>
          }
        ></Colorful>
      </div>
    </div>
  )
}

export default Room
