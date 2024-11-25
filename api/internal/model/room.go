package model

import (
	"errors"
	"sync"
)

// iRoom 房间
type iRoom struct {
	Members []string
	size    int
	mutex   sync.RWMutex
}

// iRoomManager 房间管理器
type iRoomManager struct {
	rooms sync.Map
	size  int
}

var RoomManager = &iRoomManager{
	size: 0,
}

// RoomList
// @Description 房间列表
// @Author kiritoxjf 2024-11-22 18:46:43
// @Return []string
func (m *iRoomManager) RoomList() []string {
	list := make([]string, 0)
	m.rooms.Range(func(key, value interface{}) bool {
		list = append(list, key.(string))
		return true
	})
	return list
}

// CreateRoom
// @Description 创建房间
// @Author kiritoxjf 2024-11-22 18:46:53
// @Param id string
func (m *iRoomManager) CreateRoom(id string) {
	m.rooms.Store(id, &iRoom{Members: []string{}, size: 0})
	m.size++
}

// GetRoom
// @Description 获取房间
// @Author kiritoxjf 2024-11-22 18:48:02
// @Param id string
// @Return bool
func (m *iRoomManager) GetRoom(id string) (*iRoom, bool) {
	room, exist := m.rooms.Load(id)
	if exist {
		return room.(*iRoom), exist
	}
	return nil, false
}

// JoinRoom
// @Description 加入房间
// @Author kiritoxjf 2024-11-22 19:42:53
// @Param id string
// @Param room string
// @Return error
func (m *iRoomManager) JoinRoom(id string, room string) error {
	value, ok := m.rooms.Load(room)
	if !ok {
		return errors.New("房间不存在")
	}
	r, ok := value.(*iRoom)
	if ok {
		r.mutex.Lock()
		r.Members = append(r.Members, id)
		r.size++
		r.mutex.Unlock()
	}
	m.rooms.Store(room, r)
	return nil
}

// LeaveRoom
// @Description 离开房间
// @Author kiritoxjf 2024-11-22 19:04:00
// @Param id string
// @Param room string
// @Return error

func (m *iRoomManager) LeaveRoom(id string, room string) error {
	value, ok := m.rooms.Load(room)
	if !ok {
		return errors.New("房间不存在")
	}
	r, ok := value.(*iRoom)
	if ok {
		if r.size == 1 {
			m.rooms.Delete(room)
			m.size--
			return nil
		} else {
			r.mutex.Lock()
			for i, member := range r.Members {
				if member == id {
					r.Members = append(r.Members[:i], r.Members[i+1:]...)
				}
			}
			r.size--
			r.mutex.Unlock()
		}
	}
	return nil
}

func (m *iRoomManager) GetNumb() int {
	return m.size
}

// BroadCast
// @Description 广播
// @Author kiritoxjf 2024-11-22 19:06:23
// @Param id string
// @Param msg interface{}
func (r *iRoom) BroadCast(id string, msg interface{}) {
	for _, member := range r.Members {
		if member != id {
			u, _ := UserManager.GetUser(member)
			u.EnqueueMsg(msg)
		}
	}
}
