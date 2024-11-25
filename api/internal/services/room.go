package services

import (
	"errors"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/pkg"
)

// CreateRoom
// @Description 创建房间
// @Author kiritoxjf 2024-11-22 18:11:34
// @Param id string
// @Return string
func CreateRoom(id string) string {
	room := pkg.GenerateRandomString(6)
	model.RoomManager.CreateRoom(room)
	model.MonitorManager.BroadCast(id + " 创建了房间 " + room)
	_ = JoinRoom(id, room)
	return room
}

// JoinRoom
// @Description 加入房间
// @Author kiritoxjf 2024-11-22 18:12:26
// @Param id string
// @Param room string
// @Return error
func JoinRoom(id string, room string) error {
	if err := model.RoomManager.JoinRoom(id, room); err != nil {
		return err
	}
	user, _ := model.UserManager.GetUser(id)
	user.SetRoom(room)
	model.MonitorManager.BroadCast(id + " 加入了房间 " + room)
	return nil
}

// LeaveRoom
// @Description 离开房间
// @Author kiritoxjf 2024-11-22 18:40:32
// @Param id string
// @Return error
func LeaveRoom(id string) error {
	user, exist := model.UserManager.GetUser(id)
	if !exist {
		return errors.New("非法用户")
	}
	room := user.Room.Load().(string)
	if room == "" {
		return errors.New("当前未加入任何房间")
	}
	if err := model.RoomManager.LeaveRoom(id, room); err != nil {
		return err
	}
	model.MonitorManager.BroadCast(id + " 离开了房间 " + room)
	return nil
}

// BroadCast
// @Description 广播
// @Author kiritoxjf 2024-11-22 19:24:46
// @Param id string
// @Param room string
// @Param msg interface{}
func BroadCast(id string, room string, msg interface{}) {
	r, _ := model.RoomManager.GetRoom(room)
	r.BroadCast(id, msg)
}
