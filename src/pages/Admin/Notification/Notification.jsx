import React, {useEffect, useState} from "react";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {useSelector} from "react-redux";
import axiosInstance from "../../../api/axios";
import {Button, Modal} from "antd";
import {Bell} from "lucide-react"; // Optional: for icon

const Notification = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [notifications, setNotifications] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const notificationTypeMap = {
    1: "Appointment",
    2: "Health CheckUp",
    3: "Medical Event",
    4: "Medical Registration",
    5: "Vaccination",
    6: "General Notification",
  };

  // Cập nhật lại mỗi phút để làm mới thời gian
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Lấy chi tiết notification
  const fetchNotificationDetail = async (notificationId) => {
    setLoadingDetail(true);
    try {
      const res = await axiosInstance.get(
        `/api/notifications/${notificationId}`
      );
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
            params: {pageIndex, pageSize},
          }
        );
        setNotifications(Array.isArray(res.data.items) ? res.data.items : []);
      } catch {
        setNotifications([]);
      }
    })();
  }, [userId]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(43,93,196,0.07)",
        padding: 0,
        minHeight: 400,
      }}
    >
      <div
        style={{
          padding: "24px 36px 0 36px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Bell size={28} color="#355383" style={{flexShrink: 0}} />
        <div style={{fontWeight: 700, fontSize: 26, color: "#355383"}}>
          Notifications
        </div>
      </div>
      <div
        style={{
          padding: "0",
          maxHeight: 700,
          overflowY: "auto",
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: notifications.length === 0 ? "center" : "flex-start",
          alignItems: "center",
        }}
      >
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#bbb",
              marginTop: 80,
              width: "1200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Bell size={56} color="#e0e7ef" style={{marginBottom: 8}} />
            <div style={{fontWeight: 600, fontSize: 22, color: "#888"}}>
              Không có thông báo nào
            </div>
            <div style={{color: "#aaa", fontSize: 15}}>
              Bạn sẽ nhận được thông báo mới tại đây.
            </div>
          </div>
        ) : (
          notifications.map((item, idx) => {
            const noti = item.notificationResponseDto || {};
            const notificationId = noti.notificationId;
            const isRead = noti.isRead;
            const isHovered = hoveredId === notificationId;

            // Lấy thời gian gửi (cộng 7 tiếng)
            const sendDate = noti.sendDate
              ? new Date(new Date(noti.sendDate).getTime() + 7 * 60 * 60 * 1000)
              : null;
            let timeLabel = "";
            if (sendDate) {
              const diffMs = now - sendDate.getTime();
              const diffMin = Math.floor(diffMs / 60000);
              if (diffMin <= 3) {
                timeLabel = "Vừa xong";
              } else if (diffMin < 60) {
                timeLabel = `${diffMin} phút trước`;
              } else {
                const diffHour = Math.floor(diffMin / 60);
                if (diffHour < 24) {
                  timeLabel = `${diffHour} giờ trước`;
                } else {
                  timeLabel = sendDate.toLocaleString();
                }
              }
            }

            return (
              <div
                key={notificationId || idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  borderBottom: "1px solid #f0f1f2",
                  background: isHovered
                    ? "#e6f7ff"
                    : isRead
                    ? "#fff"
                    : "#f6fafd",
                  padding: "22px 36px",
                  margin: "0 auto",
                  marginTop: 8,
                  width: "1200px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredId(notificationId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Main content */}
                <div style={{flex: 1}}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 17,
                      marginBottom: 4,
                      color: "#222",
                    }}
                  >
                    {`${notificationTypeMap[noti.type] + " Notification"}` ||
                      "No title"}
                  </div>
                  <div
                    style={{
                      color: "#444",
                      fontSize: 15,
                      marginBottom: 2,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {noti.content || ""}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#888",
                      marginTop: 2,
                    }}
                  >
                    {timeLabel}
                  </div>
                  <div style={{marginTop: 10, display: "flex", gap: 10}}>
                    <Button
                      size="small"
                      style={{background: "#355383", color: "#fff"}}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetchNotificationDetail(notificationId);
                      }}
                    >
                      Details
                    </Button>
                  </div>
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
        title="Chi tiết thông báo"
        bodyStyle={{padding: 24, paddingTop: 8, minHeight: 180}}
        transitionName="ant-zoom"
        maskTransitionName="ant-fade"
      >
        {loadingDetail ? (
          <div>Đang tải...</div>
        ) : !selectedNotification ? (
          <div style={{color: "#888"}}>Không có chi tiết thông báo.</div>
        ) : (
          (() => {
            const noti = selectedNotification.notificationResponseDto || {};
            const sender = selectedNotification.senderInformationDto || {};
            const receiver = selectedNotification.receiverInformationDto || {};
            return (
              <div>
                <div style={{fontWeight: 700, fontSize: 22, marginBottom: 12}}>
                  {`${notificationTypeMap[noti.type] + " Notification"}` ||
                    "No title"}
                </div>
                <div style={{marginBottom: 8}}>
                  <b>Người gửi:</b> {sender.userName || "Không rõ"}
                </div>
                <div style={{marginBottom: 8}}>
                  <b>Người nhận:</b> {receiver.userName || "Không rõ"}
                </div>
                <div style={{color: "#444", fontSize: 16, marginBottom: 12}}>
                  {noti.content || ""}
                </div>
                <div style={{fontSize: 12, color: "#888", marginTop: 2}}>
                  {noti.sendDate
                    ? new Date(
                        new Date(noti.sendDate).getTime() + 7 * 60 * 60 * 1000
                      ).toLocaleString()
                    : ""}
                </div>
                <div style={{marginTop: 24, textAlign: "right"}}>
                  <Button onClick={() => setShowDetailModal(false)}>
                    Đóng
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

export default Notification;
