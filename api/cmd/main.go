package main

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/controller"
)

func main() {
	r := gin.Default()
	r.GET("/ws", controller.WsHandler)
	r.POST("/api/room/create", controller.CreateRoom)
	r.POST("/api/room/join", controller.JoinRoom)
	r.GET("/api/list", controller.List)
	r.GET("/api/room", controller.Room)
	err := r.Run(":8080")
	if err != nil {
		return
	}
}
