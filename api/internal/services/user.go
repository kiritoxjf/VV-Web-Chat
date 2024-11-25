package services

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/pkg"
)

// LinkStart
// @Description 开始连接
// @Author kiritoxjf 2024-11-22 18:12:34
// @Param c *gin.Context
// @Return string
func LinkStart(c *gin.Context) string {
	id := pkg.GenerateRandomString(8)

	user := model.UserManager.AddUser(id, c)

	registerJson := map[string]string{
		"key": "register",
		"id":  id,
	}

	user.EnqueueMsg(registerJson)
	model.MonitorManager.BroadCast(id + " LINK START!!!")

	return id
}

// LinkStop
// @Description 停止连接
// @Author kiritoxjf 2024-11-22 18:12:45
// @Param id string
func LinkStop(id string) {
	user, _ := model.UserManager.GetUser(id)
	room := user.Room.Load().(string)
	if room != "" {
		leaveJson := map[string]string{
			"key": "leave",
			"id":  id,
		}
		BroadCast(id, room, leaveJson)
		_ = model.RoomManager.LeaveRoom(id, room)
	}
	model.UserManager.DelUser(id)
}
