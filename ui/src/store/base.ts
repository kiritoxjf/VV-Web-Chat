import { create } from 'zustand'

interface iDevice {
  deviceId: string
  groupId: string
  kind: string
  label: string
}

type State = {
  name: string
  avatar: string
  id: string
  room: string
  sse: EventSource | null
  devices: iDevice[]
  stream: MediaStream | null
}

type Action = {
  updateName: (name: State['name']) => void
  updateAvatar: (avatar: State['avatar']) => void
  updateId: (id: State['id']) => void
  updateRoom: (room: State['room']) => void
  updateWebsocket: (websocket: State['sse']) => void
  updateDevices: (devices: State['devices']) => void
  updateStream: (stream: State['stream']) => void
}

export const useBaseStore = create<State & Action>((update) => {
  return {
    name: '',
    avatar: '',
    id: '',
    room: '',
    sse: null,
    devices: [],
    stream: null,
    updateWebsocket: (sse) => update(() => ({ sse: sse })),
    updateName: (name) => update(() => ({ name: name })),
    updateAvatar: (avatar) => update(() => ({ avatar: avatar })),
    updateId: (id) => update(() => ({ id: id })),
    updateRoom: (room) => update(() => ({ room: room })),
    updateDevices: (devices) => update(() => ({ devices: devices })),
    updateStream: (stream) => update(() => ({ stream: stream }))
  }
})
