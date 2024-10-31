package model

import (
	"kiritoxjf/vv_chat/pkg"
	"sync"
)

// iRoom 房间
type iRoom struct {
	id      string
	Members []string
	mutex   sync.Mutex
}

// iRoomManager
type iRoomManager struct {
	rooms map[string]*iRoom
	mutex sync.Mutex
}

// RoomManager 管理器
var RoomManager = &iRoomManager{
	rooms: make(map[string]*iRoom),
}

// CreateRoom 创建房间
func (m *iRoomManager) CreateRoom(owner string) string {
	m.mutex.Lock()
	id := pkg.GenerateRandomString(5)
	m.rooms[id] = &iRoom{
		id: id,
		Members: []string{
			owner,
		},
	}
	m.mutex.Unlock()
	return id
}

// DelRoom 删除房间
func (m *iRoomManager) DelRoom(id string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.rooms, id)
}

// GetRoom 获取房间
func (m *iRoomManager) GetRoom(id string) (*iRoom, bool) {
	room, exist := m.rooms[id]
	return room, exist
}

// DelMember 删除成员
func (r *iRoom) DelMember(id string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if len(r.Members) == 1 {
		RoomManager.DelRoom(r.id)
	}
	for i, member := range r.Members {
		if member == id {
			r.Members = append(r.Members[:i], r.Members[i+1:]...)
		}
	}
}

// ListRoom 房间列表
func (m *iRoomManager) ListRoom() []string {
	var rooms []string
	for room := range m.rooms {
		rooms = append(rooms, room)
	}
	return rooms
}

// JoinMember 加入房间
func (r *iRoom) JoinMember(id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	joinJson := map[string]string{
		"key":  "join",
		"id":   id,
		"code": pkg.StatusOK,
	}
	if err := r.BroadCast(id, joinJson); err != nil {
		return err
	}
	r.Members = append(r.Members, id)
	return nil
}

// BroadCast 广播
func (r *iRoom) BroadCast(id string, msg interface{}) error {
	for _, member := range r.Members {
		if member != id {
			u, _ := UserManager.GetUser(member)
			if err := u.SafeWriteJson(msg); err != nil {
				return err
			}
		}
	}
	return nil
}
