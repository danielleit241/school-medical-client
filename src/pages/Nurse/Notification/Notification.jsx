// import  { useEffect, useState } from "react";
// import axiosInstance from "../../../api/axios";
// import { useSelector } from "react-redux";
import React from "react";

const Notification = () => {
  // const [notifications, setNotifications] = useState([]);
  // const userId = useSelector((state) => state.user.userId);
  // console.log("User ID:", userId);

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const res = await axiosInstance.get(
  //         `/api/users/${userId}/notifications`,
  //         {
  //           params: {
  //             pageSize: 40,
  //             pageIndex: 100,
  //           },
  //         }
  //       );
  //       setNotifications(res.data || []);
  //       console.log("Fetched notifications:", res.data);
  //     } catch (error) {
  //       if (error.response && error.response.status === 404) {
  //         setNotifications([]);
  //       } else {
  //         console.error("Error fetching notifications:", error);
  //         setNotifications([]);
  //       }
  //     }
  //   };
  //   if (userId) fetchNotifications();
  // }, [userId]);

  return (
    // <div>
    //   <h2>Notifications</h2>
    //   {notifications.length === 0 ? (
    //     <div>No notifications.</div>
    //   ) : (
    //     <ul>
    //       {notifications.map((item, idx) => (
    //         <li key={item.notificationId || idx} style={{ marginBottom: 16 }}>
    //           <div>
    //             <strong>notificationTypeId:</strong>{" "}
    //             {item.notificationTypeId || "N/A"}
    //           </div>
    //           <div>
    //             <strong>senderId:</strong> {item.senderId || "N/A"}
    //           </div>
    //           <div>
    //             <strong>receiverId:</strong> {item.receiverId || "N/A"}
    //           </div>
    //           <div>
    //             <strong>Title:</strong> {item.title || "No title"}
    //           </div>
    //           <div>
    //             <strong>Content:</strong> {item.content || item.message || "No content"}
    //           </div>
    //           <div>
    //             <small>
    //               {item.sendDate
    //                 ? new Date(item.sendDate).toLocaleString()
    //                 : ""}
    //             </small>
    //           </div>
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    // </div>
    <div>Hello</div>
  );
};

export default Notification;
