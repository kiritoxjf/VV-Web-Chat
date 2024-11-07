<h1 align="center">VV Web Chat</h1>
<div align="center">开源Web端语音聊天系统</div>
<h2 align="center">无人扶我青云志，我自踏雪至山巅</h2>
<p align="center">
  <img src="https://img.shields.io/badge/前端-React-12507b.svg" alt="React">
  <img src="https://img.shields.io/badge/后端-Golang-12507b.svg" alt="Golang">
  <img src="https://img.shields.io/badge/部署-Docker-12507b.svg" alt="Docker">
</p>

## English README.md

### About
VV-Chat is an open-source project that provides online voice communication with a focus on multi-party voice chat. The project is developed using the React framework for the frontend and the Gin framework for the backend. The core functionality is based on WebRTC to implement real-time voice communication. You can create rooms, and each room allows multiple users to engage in voice chats.

### Features
* Real-time multi-party voice chat: Users can create rooms and join for group voice calls.
* Open-source & free: This project is completely open-source and free to use.
* WebRTC-based: Core functionality relies on WebRTC for real-time voice communication.
* Dockerized: Easily deployable using Docker.

### Docker Image
The Docker image for this project is available on Docker Hub: [Docker Hub](https://hub.docker.com/r/kiritoxjf/vv-chat)

### Deployment
To deploy the container, use the following command:

```bash
docker run -d -p 80:80 --name <CONTAINER_NAME> kiritoxjf/vv-chat
```

### Product Progress
* v0.1 Basic 1-to-1 Chat (Completed)
* v1.0 UI Optimization (Completed)
* v2.0 Multi-party Room Calls (Completed)
* v2.1 UI Optimization & Internationalization (Completed)
* v2.* Monitoring Page (In Development)

## 中文 README.md

### 关于
VV-Chat 是一个开源项目，提供在线语音通信，核心功能基于 WebRTC 实现多人语音聊天。该项目使用 React 框架开发前端，使用 Gin 框架开发后端。用户可以创建房间并加入进行多人语音聊天。

### 功能
* 实时多人语音聊天：用户可以创建房间并参与多人语音通话。
* 开源免费：本项目完全开源且免费使用。
* 基于 WebRTC：核心功能依赖 WebRTC 实现实时语音通信。
* Docker 支持：可通过 Docker 容器轻松部署。

### Docker 镜像
本项目的 Docker 镜像可以在 Docker Hub 上找到：[Docker Hub](https://hub.docker.com/r/kiritoxjf/vv-chat)

### 部署方法
使用以下命令部署容器：

```bash
docker run -d -p 80:80 --name <CONTAINER_NAME> kiritoxjf/vv-chat
```

### 产品进度
* v0.1 基础 1 对 1 聊天（已完成）
* v1.0 UI 优化（已完成）
* v2.0 多人房间通话（已完成）
* v2.1 UI 优化与国际化（已完成）
* v2.* 监控页面（开发中）