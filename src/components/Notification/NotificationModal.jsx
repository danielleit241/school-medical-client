import React, {useEffect, useState} from "react";
import {List, Avatar, Badge, Button, Tooltip} from "antd";
import {BellOutlined, CheckCircleTwoTone} from "@ant-design/icons";
import axiosInstance from "../../api/axios";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import "./index.scss";

const NotificationModal = ({ visible = true }) => {
  const userId = useSelector((state) => state.user.userId);
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 10); // delay nhỏ để kích hoạt transition
    } else {
      setShow(false);
    }
  }, [visible]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/users/${userId}/notifications`,
        {
          params: {pageIndex: 1, pageSize: 10},
        }
      );
      setNotifications(Array.isArray(res.data.items) ? res.data.items : []);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [userId]);

  const handleViewAllNotifications = () => {
    navigate(`/${role}/notification`);
    window.location.reload();
  };

  return (
    <div
      className={`notification-modal-transition${show ? " show" : ""}`}
      style={{
        width: 350,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(-20px)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
    >
      <div
        style={{
          padding: "16px 20px 8px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h5>Notification</h5>
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Button
            type="link"
            size="middle"
            style={{padding: 0, fontWeight: 500}}
            onClick={handleViewAllNotifications}
          >
            View all
          </Button>
        </div>
      </div>
      <div style={{maxHeight: 600, padding: "8px 0"}}>
        <List
          loading={loading}
          locale={{emptyText: "No notifications."}}
          dataSource={notifications}
          renderItem={(item) => {
            const noti = item.notificationResponseDto || {};
            const isRead = noti.isRead;
            return (
              <List.Item
                key={noti.notificationId}
                style={{
                  background: isRead ? "#fff" : "#f6f8fa",
                  borderLeft: isRead
                    ? "4px solid transparent"
                    : "4px solid #1890ff",
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: isRead ? "#d9d9d9" : "#1890ff",
                        verticalAlign: "middle",
                      }}
                      icon={<BellOutlined />}
                    />
                  }
                  title={
                    <span style={{fontWeight: isRead ? 400 : 600}}>
                      {noti.title || "No title"}
                    </span>
                  }
                  description={
                    <div>
                      <div style={{color: "#555"}}>
                        {noti.content || "No content"}
                      </div>
                      <div style={{fontSize: 12, color: "#888", marginTop: 2}}>
                        {noti.sendDate
                          ? new Date(noti.sendDate).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default NotificationModal;
