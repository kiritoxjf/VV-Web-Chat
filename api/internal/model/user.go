package model

import (
	"github.com/gin-gonic/gin"
	"sync"
	"sync/atomic"
	"time"
)

// iUser 用户
type iUser struct {
	stream *gin.Context
	Room   atomic.Value
	sendCh chan interface{}
}

// EnqueueMsg 添加消息队列
func (u *iUser) EnqueueMsg(msg interface{}) {
	select {
	case u.sendCh <- msg:
	default:
		go func() {
			<-time.After(2)
			u.EnqueueMsg(msg)
		}()
	}
}

// writePump 消息队列
func (u *iUser) writePump() {
	for msg := range u.sendCh {
		u.stream.SSEvent("message", msg)
		u.stream.Writer.Flush()
	}
}

type iUserManager struct {
	users sync.Map
	size  int
}

// UserManager 管理器
var UserManager = &iUserManager{
	size: 0,
}

// AddUser 添加用户
func (m *iUserManager) AddUser(id string, stream *gin.Context) *iUser {
	user := &iUser{
		stream: stream,
		sendCh: make(chan interface{}, 200),
	}
	user.Room.Store("")
	go user.writePump()
	m.users.Store(id, user)
	m.size++
	return user
}

// GetUser 获取用户
func (m *iUserManager) GetUser(id string) (*iUser, bool) {
	user, exist := m.users.Load(id)
	if exist {
		return user.(*iUser), exist
	}
	return nil, false
}

// SetRoom 设置用户房间号
func (m *iUserManager) SetRoom(id string, room string) {
	u, e := m.GetUser(id)
	if e {
		u.SetRoom(room)
		m.users.Store(id, u)
	}
}

// SetRoom 设置用户房间号
func (u *iUser) SetRoom(id string) {
	u.Room.Store(id)
}

// DelUser 删除用户
func (m *iUserManager) DelUser(id string) {
	m.users.Delete(id)
	m.size--
}

// GetNumb 获取用户数
func (m *iUserManager) GetNumb() int {
	return m.size
}
