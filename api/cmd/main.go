package main

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/controller"
	"kiritoxjf/vv_chat/middleware"
)

// main
// @Description 主进程
// @Author kiritoxjf 2024-11-22 18:18:44
func main() {
	r := gin.Default()
	r.GET("/api/stream", controller.MainHandler)
	r.GET("/api/room", controller.RoomList)
	r.POST("/api/room", controller.CreateRoom)
	r.PUT("/api/room", controller.JoinRoom)
	r.DELETE("/api/room", controller.LeaveRoom)
	////r.GET("/api/list", controller.List)
	r.POST("/api/offer", controller.Offer)
	r.POST("/api/answer", controller.Answer)
	r.POST("/api/ice", controller.ICE)
	r.GET("/auth/check", middleware.MonitorAuth(), func(c *gin.Context) {
		c.JSON(200, gin.H{})
	})
	r.GET("/auth/notification", middleware.MonitorAuth(), controller.NotifyHandler)
	r.GET("/auth/statistic", middleware.MonitorAuth(), controller.StatisticsHandler)
	err := r.Run(":8080")
	if err != nil {
		return
	}
}
