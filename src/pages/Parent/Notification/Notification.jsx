import React, {useEffect, useState} from "react";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {useSelector} from "react-redux";
import axiosInstance from "../../../api/axios";
import {Button, Modal} from "antd";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [notifications, setNotifications] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
 
  const navigate = useNavigate();

  // Thêm state để cập nhật lại mỗi phút
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Lấy chi tiết notification
  const fetchNotificationDetail = async (notificationId) => {
    setLoadingDetail(true);
    try {
      const res = await axiosInstance.get(`/api/notifications/${notificationId}`);
      setSelectedNotification(res.data);
      setShowDetailModal(true);
    } catch {
      setSelectedNotification(null);
      setShowDetailModal(false);
    }
    setLoadingDetail(false);
  };

 useEffect(() => {
  if (!userId) return;

  (async (pageIndex = 1, pageSize = 20) => {
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
  })();
}, [userId]);

 

  // STEP 1: Danh sách thông báo
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
          maxHeight: 700,
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
            const isHovered = hoveredId === notificationId;

            // Lấy thời gian gửi (cộng 7 tiếng)
            const sendDate = noti.sendDate ? new Date(new Date(noti.sendDate).getTime() + 7 * 60 * 60 * 1000) : null;
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

            // Hàm xử lý điều hướng khi click vào thông báo
            const handleNotificationClick = () => {
              if (noti.title === "New Appointment Notification" ) {
                navigate("/nurse/appointment-management/appointment-list");
                window.location.reload();
              }
            // Có thể thêm các điều kiện khác nếu cần
          };

            return (
              <div
                key={notificationId || idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottom: "1px solid #e0e0e0",
                  background: isHovered
                    ? "#e6f7ff"
                    : isRead
                    ? "#fff"
                    : "#f6fafd",
                  padding: "18px 28px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={() => setHoveredId(notificationId)}
                onMouseLeave={() => setHoveredId(null)}
                
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
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginTop: 2,
                  }}
                >
                  {timeLabel}
                </div>
                <div style={{marginTop: 8}}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={async () => {                   
                      await fetchNotificationDetail(notificationId);
                    }}
                  >
                    Details
                  </Button> 

                  <Button
                    style={{marginLeft: 8}}
                    size="small"
                    type="primary"
                    onClick={() => {
                      handleNotificationClick();
                    }}
                  >
                    View
                  </Button>             
                </div>
              </div>
            );
          })
        )}
      </div>
      <Modal
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        centered
        destroyOnClose
        title="Notification Detail"
        bodyStyle={{padding: 24, paddingTop: 8, minHeight: 180}}
        transitionName="ant-zoom"
        maskTransitionName="ant-fade"
      >
        {loadingDetail ? (
          <div>Loading...</div>
        ) : !selectedNotification ? (
          <div style={{color: "#888"}}>No notification detail.</div>
        ) : (
          (() => {
            const noti = selectedNotification.notificationResponseDto || {};
            const sender = selectedNotification.senderInformationDto || {};
            const receiver = selectedNotification.receiverInformationDto || {};
            return (
              <div>
                <div 
                style={{fontWeight: 700, 
                fontSize: 22, 
                marginBottom: 12
                }}
                >
                  {noti.title || "No title"}
                </div>
                <div 
                style={{marginBottom: 8
                  }}
                >
                  <b>Sender:</b> {sender.userName || "Unknown"}
                </div>
                <div style=
                {{marginBottom: 8
                  }}
                >
                  <b>Receiver:</b> {receiver.userName || "Unknown"}
                </div>
                <div 
                style={{color: "#444", 
                fontSize: 16, 
                marginBottom: 12
                }}
                >
                  {noti.content || ""}
                </div>
                <div 
                style={{fontSize: 12, 
                color: "#888", 
                marginTop: 2
                }}
                >
                  {noti.sendDate
                  ? new Date(new Date(noti.sendDate).getTime() + 7 * 60 * 60 * 1000).toLocaleString()
                  : ""}
                </div>
                <div style={{marginTop: 24, textAlign: "right"}}>
                  <Button onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
