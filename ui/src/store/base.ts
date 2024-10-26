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
  ws: WebSocket | null
  devices: iDevice[]
  activeDevice: iDevice | null
}

type Action = {
  updateName: (name: State['name']) => void
  updateAvatar: (avatar: State['avatar']) => void
  updateId: (id: State['id']) => void
  updateRoom: (room: State['room']) => void
  updateWebsocket: (websocket: State['ws']) => void
  updateDevices: (devices: State['devices']) => void
  updateActiveDevice: (device: State['activeDevice']) => void
}

export const useBaseStore = create<State & Action>((update) => {
  return {
    name: '',
    avatar: '',
    id: '',
    room: '',
    ws: null,
    devices: [],
    activeDevice: null,
    updateWebsocket: (ws) => update(() => ({ ws: ws })),
    updateName: (name) => update(() => ({ name: name })),
    updateAvatar: (avatar) => update(() => ({ avatar: avatar })),
    updateId: (id) => update(() => ({ id: id })),
    updateRoom: (room) => update(() => ({ room: room })),
    updateDevices: (devices) => update(() => ({ devices: devices })),
    updateActiveDevice: (device) => update(() => ({ activeDevice: device })),
  }
})
