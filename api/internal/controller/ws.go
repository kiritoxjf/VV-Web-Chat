package controller

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/pkg"
	"log"
	"net/http"
)

// upgrade 升级Websocket
var upgrade = websocket.Upgrader{
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
	defer func(conn *websocket.Conn) {
		err := conn.Close()
		if err != nil {
			log.Println(err)
		}
	}(conn)

	connID := pkg.GenerateRandomString(8)

	model.AddUser(connID, ip, conn)

	registerJson := map[string]string{
		"key":   "register",
		"value": connID,
		"code":  StatusOK,
	}
	err = conn.WriteJSON(registerJson)
	//err = conn.WriteMessage(websocket.TextMessage, responseJson)
	if err != nil {
		return
	}

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		if messageType == websocket.TextMessage {
			var msgData map[string]string
			err = json.Unmarshal(message, &msgData)
			if err != nil {
				log.Println(err)
				continue
			}

			key := msgData["key"]
			switch key {
			case "knock":
				// 拨号
				knock(msgData, message, conn)
				break
			case "knocked":
				// 拨号反馈
				knocked(msgData, message, conn)
				break
			case "ice":
				// 交换ICE
				exchange(msgData, message, conn)
				break
			case "offer":
				// 发送Offer
				exchange(msgData, message, conn)
				break
			case "answer":
				// 返回Answer
				exchange(msgData, message, conn)
				break
			case "hangup":
				// 挂断
				exchange(msgData, message, conn)
				break
			}
		}
	}

	model.DelUser(connID)
}

// WsListHandler WS连接列表
func WsListHandler(c *gin.Context) {
	ids := model.ListConn()
	c.JSON(200, gin.H{
		"ids":   ids,
		"total": len(ids),
	})
}

const (
	// AppError 客户端错误
	AppError = "400"

	// RemoteError 远程端错误
	RemoteError = "500"

	// InfoCode 信息传递
	InfoCode = "100"

	// StatusOK 成功
	StatusOK = "200"

	// Denial 拒接
	Denial = "501"
)

// checkTarget 检查Target
func checkTarget(data map[string]string, conn *websocket.Conn) *websocket.Conn {
	target := data["target"]
	targetConn := model.GetConn(target)
	if targetConn == nil {
		responseJson, err := json.Marshal(map[string]string{
			"key":     "knocked",
			"code":    AppError,
			"message": "用户名不存在！",
		})
		err = conn.WriteMessage(websocket.TextMessage, responseJson)
		if err != nil {
			return nil
		}
		return nil
	} else {
		return targetConn
	}
}

// knock 呼叫
func knock(data map[string]string, message []byte, conn *websocket.Conn) {
	targetConn := checkTarget(data, conn)
	if targetConn != nil {
		err := targetConn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			return
		}
	}
}

// knocked 呼叫反馈
func knocked(data map[string]string, message []byte, conn *websocket.Conn) {
	targetConn := checkTarget(data, conn)

	err := targetConn.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		return
	}
}

// exchange 交换信息
func exchange(data map[string]string, message []byte, conn *websocket.Conn) {
	targetConn := checkTarget(data, conn)

	err := targetConn.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		return
	}
}
