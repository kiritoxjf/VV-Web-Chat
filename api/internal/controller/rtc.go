package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"net/http"
)

// Offer 发送Offer
func Offer(c *gin.Context) {
	var json struct {
		Source string `json:"source"`
		Target string `json:"target"`
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
		Offer  string `json:"offer"`
	}
	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	_, exist := model.UserManager.GetUser(json.Source)
	if !exist {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	target, exist := model.UserManager.GetUser(json.Target)
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "对方不存在",
		})
		return
	}

	offerJson := map[string]string{
		"key":    "offer",
		"id":     json.Source,
		"name":   json.Name,
		"avatar": json.Avatar,
		"offer":  json.Offer,
	}

	if err := target.SafeWriteJson(offerJson); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "发送Offer失败",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}

// Answer 回复Answer
func Answer(c *gin.Context) {
	var json struct {
		Source string `json:"source"`
		Target string `json:"target"`
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
		Answer string `json:"answer"`
	}

	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	_, exist := model.UserManager.GetUser(json.Source)
	if !exist {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	target, exist := model.UserManager.GetUser(json.Target)
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "对方不存在",
		})
		return
	}

	answerJson := map[string]string{
		"key":    "answer",
		"id":     json.Source,
		"name":   json.Name,
		"avatar": json.Avatar,
		"answer": json.Answer,
	}
	if err := target.SafeWriteJson(answerJson); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "发送Answer失败",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}

// ICE 发送ICE
func ICE(c *gin.Context) {
	var json struct {
		Source    string `json:"source"`
		Target    string `json:"target"`
		Candidate string `json:"candidate"`
	}

	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	_, exist := model.UserManager.GetUser(json.Source)
	if !exist {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	target, exist := model.UserManager.GetUser(json.Target)
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "对方不存在",
		})
		return
	}

	iceJson := map[string]string{
		"key":       "ice",
		"id":        json.Source,
		"candidate": json.Candidate,
	}
	if err := target.SafeWriteJson(iceJson); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "发送ICE失败",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}
