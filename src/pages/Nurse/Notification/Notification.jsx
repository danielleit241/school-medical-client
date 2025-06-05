import React, { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";

const Notifications = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // Lấy số lượng chưa đọc
  const fetchUnread = async () => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(
        `/api/users/${userId}/notifications/unread`
      );
      setUnreadCount(res.data?.unreadCount ?? res.data ?? 0);
    } catch {
      setUnreadCount(0);
    }
  };

  // Lấy danh sách notification (thêm pageIndex, pageSize)
  const fetchNotifications = async (pageIndex = 1, pageSize = 20) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(
        `/api/users/${userId}/notifications`,
        {
          params: { pageIndex, pageSize },
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
        (item) => item.notificationResponseDto?.notificationId === notificationId
      )?.notificationResponseDto;
      if (!noti || noti.isRead) return;

      await axiosInstance.put(
        `/api/users/${userId}/notifications`,
        { notificationId }
      );
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
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      fetchUnread();
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUnread();
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
          fetchUnread();
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
    <div>
      <h1>({unreadCount} unread)</h1>
      <ul>
        {notifications.length === 0 ? (
          <li>No notifications.</li>
        ) : (
          notifications.map((item, idx) => {
            const noti = item.notificationResponseDto || {};
            const notificationId = noti.notificationId;
            const isRead = noti.isRead;
            return (
              <li
                key={notificationId || idx}
                style={{
                  marginBottom: 12,
                  background: isRead ? "#f5f5f5" : "#fff",
                  cursor: "pointer",
                  opacity: isRead ? 0.7 : 1,
                }}
                onClick={() => {
                  if (notificationId) handleReadNotification(notificationId);
                }}
              >
                <div>
                  <strong>{noti.title || "No title"}</strong>
                </div>
                <div>
                  <b>Content:</b> {noti.content || "No content"}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default Notifications;
