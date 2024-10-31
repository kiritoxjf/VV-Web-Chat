package model

import (
	"github.com/gorilla/websocket"
	"kiritoxjf/vv_chat/pkg"
	"sync"
)

// iUser 用户
type iUser struct {
	ws     *websocket.Conn
	roomId string
	ip     string
	mutex  sync.Mutex
}

// iUserManager 用户管理器
type iUserManager struct {
	users map[string]*iUser
	mutex sync.Mutex
}

// UserManager 管理器
var UserManager = &iUserManager{
	users: make(map[string]*iUser),
}

// AddUser 添加用户
func (m *iUserManager) AddUser(id string, ip string, ws *websocket.Conn) *iUser {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	m.users[id] = &iUser{
		ws:     ws,
		ip:     ip,
		roomId: "",
	}
	return m.users[id]
}

// GetUser 获取用户
func (m *iUserManager) GetUser(id string) (*iUser, bool) {
	user, exist := m.users[id]
	return user, exist
}

// JoinRoom 加入房间
func (u *iUser) JoinRoom(roomId string) {
	u.mutex.Lock()
	defer u.mutex.Unlock()
	u.roomId = roomId
}

// SafeWriteJson 互斥写入
func (u *iUser) SafeWriteJson(msg interface{}) error {
	u.mutex.Lock()
	defer u.mutex.Unlock()
	conn := u.ws
	err := conn.WriteJSON(msg)
	if err != nil {
		return err
	}
	return nil
}

// DelUser 删除用户
func (m *iUserManager) DelUser(id string) {
	if m.users[id].roomId != "" {
		leaveJson := map[string]string{
			"key":  "leave",
			"id":   id,
			"code": pkg.StatusOK,
		}
		room, _ := RoomManager.GetRoom(m.users[id].roomId)
		if err := room.BroadCast(id, leaveJson); err != nil {
			println(err.Error())
		}
		room.DelMember(id)
	}
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.users, id)
}

// ListUser 获取用户列表
func (m *iUserManager) ListUser() []string {
	var ids []string
	for u := range m.users {
		ids = append(ids, u)
	}
	return ids
}
