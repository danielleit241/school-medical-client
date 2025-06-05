import React, { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useSelector } from "react-redux";
import axiosInstance from "../../../api/axios";
import { Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";

const Notifications = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("accessToken");

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
      console.log("Notifications:", res.data);
      setNotifications(Array.isArray(res.data.items) ? res.data.items : []);
    } catch {
      setNotifications([]);
    }
  };

 

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          notificationResponseDto: {
            ...item.notificationResponseDto,
            isRead: true,
          },
        }))
      );
      setUnreadCount(0);
      fetchUnread();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
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
    // eslint-disable-next-line
  }, [userId, token]);
  console.log("notifications state:", notifications);

  return (
    <div>
      <Badge count={unreadCount}>
        <BellOutlined
          style={{ fontSize: 32, color: "#1890ff", cursor: "pointer" }}
          onClick={handleMarkAllAsRead}
        />
      </Badge>
      <h1>({unreadCount} unread)</h1>
      {/* Nếu vẫn muốn giữ danh sách thông báo, có thể để dưới đây */}
      <ul>
        {notifications.length === 0 ? (
          <li>No notifications.</li>
        ) : (
          notifications.map((item, idx) => {
            const noti = item.notificationResponseDto || {};
            const notificationId = noti.notificationId;
            return (
              <li
                key={notificationId || idx}
                style={{
                  marginBottom: 12,
                  background:  "#fff"
                }}
              >
                <div>
                  <strong>{noti.title || "No title"}</strong>
                </div>
                <div>
                  <b>Content:</b> {noti.content || "No content"}
                </div>
                <div>
                  <small>
                    {noti.sendDate
                      ? new Date(noti.sendDate).toLocaleString()
                      : ""}
                  </small>
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
