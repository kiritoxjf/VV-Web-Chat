package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/pkg"
	"log"
	"net/http"
)

// upgrade 升级Websocket
var upgrade = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WsHandler WS主连接
func WsHandler(c *gin.Context) {
	ip := c.GetHeader("X-Real-IP")

	conn, err := upgrade.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to upgrade to WebSocket"})
		return
	}

	connID := pkg.GenerateRandomString(8)

	user := model.UserManager.AddUser(connID, ip, conn)

	registerJson := map[string]string{
		"key":  "register",
		"id":   connID,
		"code": pkg.StatusOK,
	}
	if err = user.SafeWriteJson(registerJson); err != nil {
		log.Println(err)
		return
	}

	for {
		if _, _, err := conn.NextReader(); err != nil {
			model.UserManager.DelUser(connID)
			err := conn.Close()
			if err != nil {
				log.Println(err)
				return
			}
			break
		}
	}

}
