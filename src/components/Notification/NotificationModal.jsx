import React, {useEffect, useState, useRef} from "react";
import {List, Avatar, Button} from "antd";
import {BellOutlined} from "@ant-design/icons";
import axiosInstance from "../../api/axios";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

import "./index.scss";

const NotificationModal = ({visible = true}) => {
  const token = localStorage.getItem("accessToken");
  const userId = useSelector((state) => state.user.userId);
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);

  const notificationTypeMap = {
    1: "Appointment",
    2: "HealthCheck",
    3: "MedicalEvent",
    4: "MedicalRegistration",
    5: "Vaccination",
    6: "GeneralNotification",
  };
  // State để cập nhật lại label thời gian mỗi phút
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 10);
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
      console.log("Notifications fetched:", res.data.items);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [userId]);

  const handleViewAllNotifications = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setUnreadCount(0);
      unreadCountRef.current = 0;
    } catch (err) {
      console.log(err);
    }
    navigate(`/${role}/notification`);
    window.location.reload();
  };

  // Lấy số lượng chưa đọc và websocket realtime
  useEffect(() => {
    // Lấy số lượng chưa đọc
    const fetchUnread = async () => {
      if (!userId) return;
      try {
        const res = await axiosInstance.get(
          `/api/users/${userId}/notifications/unread`
        );
        const newCount = res.data?.unreadCount ?? res.data ?? 0;
        setUnreadCount(newCount);
        unreadCountRef.current = newCount;
      } catch {
        setUnreadCount(0);
        unreadCountRef.current = 0;
      }
    };
    fetchUnread();

    // Websocket realtime
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
        connection.on("NotificationSignal", async () => {
          await fetchNotifications();
          await fetchUnread();
        });
      })
      .catch((err) => console.error("Error while starting connection: ", err));

    return () => {
      connection.stop();
    };
    // eslint-disable-next-line
  }, [userId, token]);

  const handleNotificationClick = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setUnreadCount(0);
      unreadCountRef.current = 0;
    } catch (err) {
      console.log(err);
    }
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
        <div>
          <h5>Notification</h5>
          <BellOutlined style={{color: "black", marginRight: 8}} />
          Notification UnRead:{" "}
          <span style={{color: "black", marginLeft: 4}}>{unreadCount}</span>
        </div>
        <div>
          <Button
            type="link"
            size="middle"
            style={{padding: 0, fontWeight: 500}}
            onClick={() => {
              handleViewAllNotifications();
              handleNotificationClick();
            }}
          >
            View all
          </Button>
        </div>
      </div>
      <div
        style={{
          maxHeight: 600,
          padding: "8px 0",
          overflowY: "auto",
        }}
      >
        <List
          loading={loading}
          locale={{emptyText: "No notifications."}}
          dataSource={notifications}
          renderItem={(item) => {
            const noti = item.notificationResponseDto || {};
            const isRead = noti.isRead;
            const isHovered = hoveredId === noti.notificationId;

            // Lấy thời gian gửi (cộng 7 tiếng)
            const sendDate = noti.sendDate
              ? new Date(new Date(noti.sendDate).getTime() + 7 * 60 * 60 * 1000)
              : null;
            let timeLabel = "";
            if (sendDate) {
              const diffMs = now - sendDate.getTime();
              const diffMin = Math.floor(diffMs / 60000);
              if (diffMin <= 3) {
                timeLabel = "now";
              } else if (diffMin < 60) {
                timeLabel = `${diffMin} minutes ago`;
              } else {
                const diffHour = Math.floor(diffMin / 60);
                if (diffHour < 24) {
                  timeLabel = `${diffHour} hours ago`;
                } else {
                  timeLabel = sendDate.toLocaleString();
                }
              }
            }

            const handleNotificationClick = () => {
              if (role === "parent") {
                switch (noti.type) {
                  case 1: // Appointment
                    navigate("/parent/appointment-history");
                    window.location.reload();
                    break;
                  case 2: // HealthCheck : chưa sửa
                    navigate("/parent/health-check/history");
                    window.location.reload();
                    break;
                  case 3: // MedicalEvent
                    navigate("/parent/medical-event/children-list");
                    window.location.reload();
                    break;
                  case 4: // MedicalRegistration
                    navigate("/parent/medical-registration/list");
                    window.location.reload();
                    break;
                  case 5: // Vaccination: chưa sửa
                    navigate("/parent/timetable");
                    window.location.reload();
                    break;
                  default:
                    // Có thể bổ sung các loại khác nếu cần
                    break;
                }
              } else if (role === "nurse") {
                if (noti.type === 1) {
                  // Appointment for nurse
                  navigate("/nurse/appointment-management/appointment-list");
                  window.location.reload();
                }
                if(noti.type === 4) {
                  // MedicalRegistration for nurse
                  navigate("/nurse/medical-received/medical-received-list");
                  window.location.reload();
                }
                // Có thể bổ sung các loại khác cho nurse nếu cần
              }
            };

            return (
              <List.Item
                key={noti.notificationId}
                style={{
                  background: isHovered
                    ? "#e6f7ff"
                    : isRead
                    ? "#fff"
                    : "#f6f8fa",
                  borderLeft: isRead
                    ? "4px solid transparent"
                    : "4px solid #1890ff",
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={() => setHoveredId(noti.notificationId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={handleNotificationClick}
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
                      {notificationTypeMap[noti.type] || "No title"}
                    </span>
                  }
                  description={
                    <div>
                      <div style={{color: "#555"}}>
                        {noti.content || "No content"}
                      </div>
                      <div style={{fontSize: 12, color: "#888", marginTop: 2}}>
                        {timeLabel}
                      </div>
                    </div>
                  }
                />
                {noti.type === 5 && role === "parent" && (
                  <VaccinationConfirmButton sourceId={noti.sourceId} />
                )}
                {noti.type === 2 && role === "parent" && (
                  <HealthCheckConfirmButton sourceId={noti.sourceId} />
                )}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

const HealthCheckConfirmButton = ({sourceId}) => {
  const [status, setStatus] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  useEffect(() => {
    if (sourceId) {
      axiosInstance
        .get(`/api/health-check-results/${sourceId}/is-confirmed`)
        .then((res) => {
          setStatus(res.data);
        });
    }
  }, [sourceId]);
  const handleConfirm = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await axiosInstance.put(`/api/health-check-results/${sourceId}/confirm`, {
        status: true,
      });
      const res = await axiosInstance.get(
        `/api/health-check-results/${sourceId}/is-confirmed`
      );
      setStatus(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    setCancelLoading(true);
    try {
      await axiosInstance.put(`/api/health-check-results/${sourceId}/confirm`, {
        status: false,
      });
      const res = await axiosInstance.get(
        `/api/health-check-results/${sourceId}/is-confirmed`
      );
      console.log("Status after cancel:", res.data, "for", sourceId);
      setStatus(res.data);
    } finally {
      setCancelLoading(false);
    }
  };

  if (status === false) {
    return <span style={{color: "red", marginLeft: 8}}>Canceled</span>;
  }

  return (
    <>
      <Button
        type={status === true ? "default" : "primary"}
        disabled={status === true}
        loading={loading}
        size="small"
        onClick={handleConfirm}
        style={{marginLeft: "auto", marginRight: 8}}
      >
        {status === true ? "Confirmed" : "Confirm"}
      </Button>
      {status !== true && (
        <Button
          danger
          type="default"
          loading={cancelLoading}
          size="small"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      )}
    </>
  );
};

const VaccinationConfirmButton = ({sourceId}) => {
  const [status, setStatus] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (sourceId) {
      axiosInstance
        .get(`/api/vaccination-results/${sourceId}/is-confirmed`)
        .then((res) => {
          console.log("Status from API:", res.data?.status, "for", sourceId);
          setStatus(res.data);
        });
    }
  }, [sourceId]);

  const handleConfirm = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await axiosInstance.put(`/api/vaccination-results/${sourceId}/confirm`, {
        status: true,
      });
      const res = await axiosInstance.get(
        `/api/vaccination-results/${sourceId}/is-confirmed`
      );
      console.log("Status after confirm:", res.data, "for", sourceId);
      setStatus(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    setCancelLoading(true);
    try {
      await axiosInstance.put(`/api/vaccination-results/${sourceId}/confirm`, {
        status: false,
      });
      const res = await axiosInstance.get(
        `/api/vaccination-results/${sourceId}/is-confirmed`
      );
      setStatus(res.data);
    } finally {
      setCancelLoading(false);
    }
  };

  if (status === false) {
    return <span style={{color: "red", marginLeft: 8}}>Canceled</span>;
  }

  return (
    <>
      <Button
        type={status === true ? "default" : "primary"}
        disabled={status === true}
        loading={loading}
        size="small"
        onClick={handleConfirm}
        style={{marginLeft: "auto", marginRight: 8}}
      >
        {status === true ? "Confirmed" : "Confirm"}
      </Button>
      {status !== true && (
        <Button
          danger
          type="default"
          loading={cancelLoading}
          size="small"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      )}
    </>
  );
};

export default NotificationModal;
