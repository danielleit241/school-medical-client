import React, {useEffect, useState} from "react";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {useSelector} from "react-redux";
import {useLocation} from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {Badge} from "antd";
import {BellOutlined} from "@ant-design/icons";

const Notifications = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // Lấy danh sách notification (thêm pageIndex, pageSize)
  const fetchNotifications = async (pageIndex = 1, pageSize = 20) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(
        `/api/users/${userId}/notifications`,
        {
          params: {pageIndex, pageSize},
        }
      );
      setNotifications(Array.isArray(res.data.items) ? res.data.items : []);
    } catch {
      setNotifications([]);
    }
  };

  // Đánh dấu đã đọc từng thông báo
  const handleReadNotification = async (notificationId) => {
    try {
      const noti = notifications.find(
        (item) =>
          item.notificationResponseDto?.notificationId === notificationId
      )?.notificationResponseDto;
      if (!noti || noti.isRead) return;

      await axiosInstance.put(`/api/users/${userId}/notifications`, {
        notificationId,
      });
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationResponseDto?.notificationId === notificationId
            ? {
                ...item,
                notificationResponseDto: {
                  ...item.notificationResponseDto,
                  isRead: true,
                },
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications(1, 20);
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7009/notificationHub", {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        connection.on("NotificationSignal", () => {
          fetchNotifications(1, 20);
        });
      })
      .catch((err) => console.error("Error while starting connection: ", err));

    return () => {
      connection.stop();
    };
    // Khi nhận state.reload từ navigate, sẽ reload lại danh sách
    // eslint-disable-next-line
  }, [userId, token, location.state?.reload]);
  console.log("notifications state:", notifications);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: 0,
      }}
    >
      <div
        style={{
          padding: "18px 28px 0 28px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <div style={{fontWeight: 700, fontSize: 22, marginBottom: 8}}>
          Notifications
        </div>
      </div>
      <div
        style={{
          padding: "0 0 0 0",
          maxHeight: 700, // hoặc giá trị bạn muốn
          overflowY: "auto",
        }}
      >
        {notifications.length === 0 ? (
          <div style={{textAlign: "center", color: "#888", marginTop: 40}}>
            No notifications.
          </div>
        ) : (
          notifications.map((item, idx) => {
            const noti = item.notificationResponseDto || {};
            const notificationId = noti.notificationId;
            const isRead = noti.isRead;

            return (
              <div
                key={notificationId || idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottom: "1px solid #e0e0e0",
                  background: isRead ? "#fff" : "#f6fafd",
                  padding: "18px 28px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  if (notificationId) handleReadNotification(notificationId);
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {noti.title || "No title"}
                </div>
                <div
                  style={{
                    color: "#444",
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                >
                  {noti.content || ""}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
