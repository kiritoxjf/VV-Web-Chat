package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/internal/services"
	"net/http"
)

// RoomList
// @Description 房间列表
// @Author kiritoxjf 2024-11-22 18:17:35
// @Param c *gin.Context
func RoomList(c *gin.Context) {
	list := model.RoomManager.RoomList()
	c.JSON(http.StatusOK, gin.H{
		"list": list,
	})
}

// CreateRoom
// @Description 创建房间
// @Author kiritoxjf 2024-11-22 18:14:34
// @Param c *gin.Context
func CreateRoom(c *gin.Context) {
	var json struct {
		ID string `json:"id"`
	}
	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	if _, exist := model.UserManager.GetUser(json.ID); exist == true {
		room := services.CreateRoom(json.ID)
		c.JSON(http.StatusOK, gin.H{
			"id": room,
		})
		return
	} else {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
}

// JoinRoom
// @Description 加入房间
// @Author kiritoxjf 2024-11-22 18:52:21
// @Param c *gin.Context
func JoinRoom(c *gin.Context) {
	var json struct {
		ID     string `json:"id"`
		Room   string `json:"roomId"`
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
	}

	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	if _, exist := model.UserManager.GetUser(json.ID); exist == true {
		if err := services.JoinRoom(json.ID, json.Room); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		joinJson := map[string]string{
			"key":    "join",
			"id":     json.ID,
			"name":   json.Name,
			"avatar": json.Avatar,
		}
		services.BroadCast(json.ID, json.Room, joinJson)
		c.JSON(http.StatusOK, gin.H{})
		return
	} else {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
}

// LeaveRoom
// @Description 离开房间
// @Author kiritoxjf 2024-11-22 18:18:10
// @Param c *gin.Context
func LeaveRoom(c *gin.Context) {
	id := c.Query("id")
	u, exist := model.UserManager.GetUser(id)
	if !exist {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "非法用户",
		})
		return
	}
	leaveJson := map[string]string{
		"key": "leave",
		"id":  id,
	}
	room := u.Room.Load().(string)
	r, _ := model.RoomManager.GetRoom(room)
	r.BroadCast(id, leaveJson)
	if err := services.LeaveRoom(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	u.SetRoom("")
	c.JSON(http.StatusOK, gin.H{})
}
