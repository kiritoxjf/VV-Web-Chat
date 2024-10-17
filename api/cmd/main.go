package main

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/controller"
)

func main() {
	r := gin.Default()
	r.GET("/ws", controller.WsHandler)
	r.GET("/api/list", controller.WsListHandler)
	err := r.Run(":8080")
	if err != nil {
		return
	}
}
