import React, {useEffect, useRef, useState} from "react";
import "./Header.scss";
import {NavLink, useNavigate} from "react-router-dom";
import HeaderLogoTop from "../../assets/images/Medical.svg";
import HeaderLogoBottom from "../../assets/images/Black Modern Medical Logo.svg";
import Call_Icon from "../../assets/images/Call_Icon.svg";
import Clock_Icon from "../../assets/images/Clock_Icon.svg";
import Location_Icon from "../../assets/images/Location_Icon.svg";
import {useSelector} from "react-redux";
import {Badge, Dropdown, Avatar, Menu} from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {RiArrowDownSFill} from "react-icons/ri";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import axiosInstance from "../../api/axios";
import LogoDefault from "../../assets/images/defaultlogo.svg";
import NotificationModal from "../Notification/NotificationModal";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = useSelector((state) => state.user.role);
  const userId = useSelector((state) => state.user.userId);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!userId || !token) {
      console.error("User ID or token is missing");
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/user-profile/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId]);

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
        unreadCountRef.current = newCount; // Cập nhật ref
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
        connection.on("NotificationSignal", () => {
          const prevCount = unreadCountRef.current;
          fetchUnread();
          if (unreadCountRef.current > prevCount) {
            const audio = new Audio("/ting.mp3");
            audio.play();
          }
        });
      })
      .catch((err) => console.error("Error while starting connection: ", err));

    return () => {
      connection.stop();
    };
  }, [userId, token]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  // Hàm xử lý khi click vào Notification trong dropdown
  const handleNotificationClick = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
    setIsNotificationModalOpen(true);
  };

  // Dropdown menu for avatar
  const menu = (
    <Menu>
      <Menu.Item key="notification" onClick={handleNotificationClick}>
        <span
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <BellOutlined style={{color: "black", marginRight: 8}} />
          Notification:{" "}
          <span style={{color: "black", marginLeft: 4}}>{unreadCount}</span>
        </span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate(`/${role}/profile`)}
      >
        User Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (!isNotificationModalOpen) return;
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationModalOpen]);

  return (
    <>
      <div className="header">
        <div className="header__top flex justify-around items-center p-2.5">
          <div className="header__top-left">
            <img src={HeaderLogoTop} alt="Medical Logo Top" />
          </div>
          <div className="header__top-right">
            <ul className="header__top-right-list">
              <li className="header__top-right-item flex items-center gap-3 mr-7">
                <img
                  className="m-w-[100%] h-[35px]"
                  src={Call_Icon}
                  alt="Call Icon"
                />
                <div>
                  <p className="header__text text-white m-0">Emergency</p>
                  <p className="header__text m-0">(237) 681-812-255</p>
                </div>
              </li>
              <li className="header__top-right-item flex items-center gap-3 mr-7">
                <img
                  className="m-w-[100%] h-[35px]"
                  src={Clock_Icon}
                  alt="Clock Icon"
                />
                <div>
                  <p className="header__text text-white m-0">Working Hours</p>
                  <p className="header__text m-0">
                    Mon - Fri: 8:00 AM - 5:00 PM
                  </p>
                </div>
              </li>
              <li className="header__top-right-item flex items-center gap-3 mr-7">
                <img
                  className="m-w-[100%] h-[35px]"
                  src={Location_Icon}
                  alt="Location Icon"
                />
                <div>
                  <p className="header__text text-white m-0">Location</p>
                  <p className="header__text m-0">
                    123 Medical St, Health City
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="header__bottom flex justify-center items-center bg-white">
          <div className="header__bottom-image ml-10">
            <NavLink
              to="/"
              style={{textDecoration: "none"}}
              className={({isActive}) => (isActive ? "active-link" : "")}
              end
            >
              <img src={HeaderLogoBottom} alt="Medical Logo Bottom" />
            </NavLink>
          </div>

          {/* Navigation bar đã được căn giữa */}
          <nav className="header__bottom-navbar mx-auto">
            <ul className="header__bottom-list flex justify-center items-center gap-5 font-bold mb-0">
              <li className="header__bottom-item relative">
                <NavLink
                  to="/"
                  style={{textDecoration: "none", fontSize: 20}}
                  className={({isActive}) => (isActive ? "active-link" : "")}
                  end
                >
                  Home
                </NavLink>
                <div className="absolute bg-[#355383]"></div>
              </li>
              <li className="header__bottom-item">
                <NavLink
                  to="/resources"
                  style={{textDecoration: "none", fontSize: 20}}
                  className={({isActive}) => (isActive ? "active-link" : "")}
                >
                  Vaccines
                </NavLink>
              </li>
              <li className="header__bottom-item">
                <NavLink
                  to="/blog"
                  style={{textDecoration: "none", fontSize: 20}}
                  className={({isActive}) => (isActive ? "active-link" : "")}
                >
                  Blog
                </NavLink>
              </li>
              <li className="header__bottom-item">
                <NavLink
                  to="/contact"
                  style={{textDecoration: "none", fontSize: 20}}
                  className={({isActive}) => (isActive ? "active-link" : "")}
                >
                  Contact
                </NavLink>
              </li>
              <li className="header__bottom-item">
                <NavLink
                  to="/parent"
                  style={{textDecoration: "none", fontSize: 20}}
                  className={({isActive}) => (isActive ? "active-link" : "")}
                >
                  Services
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="header__bottom-button flex justify-center items-center gap-4 mr-10">
            {token && role ? (
              <div className="flex items-center gap-3">
                <span
                  style={{color: "#355383", fontWeight: "bold", fontSize: 20}}
                >
                  Hello, {role}
                </span>
                <Dropdown overlay={menu} trigger={["click"]}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <Badge
                      count={unreadCount}
                      size="small"
                      offset={[-5, 5]}
                      style={{backgroundColor: "red"}}
                    >
                      <Avatar
                        size={50}
                        src={
                          user && user.avatarUrl && user.avatarUrl.trim() !== ""
                            ? user.avatarUrl
                            : LogoDefault
                        }
                        style={{cursor: "pointer", border: "2px solid #eee"}}
                      />
                    </Badge>
                    <RiArrowDownSFill
                      style={{
                        fontSize: 20, // Đổi số này để tăng/giảm kích thước
                        marginLeft: 6,
                        color: "#aaa",
                        position: "absolute",
                        bottom: -5,
                        right: -5,
                        backgroundColor: "#F8F8F8",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </Dropdown>
              </div>
            ) : (
              <>
                <div>
                  <NavLink
                    className="header__login"
                    to="/login"
                    style={{textDecoration: "none"}}
                  >
                    <button>Login</button>
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {isNotificationModalOpen && (
        <div
          ref={notificationRef}
          className="notification-dropdown"
          style={{
            position: "absolute",
            top: "130px", // điều chỉnh cho đúng ngay dưới avatar
            right: 60,
            width: 400,
            background: "#fff",
            borderRadius: 10,
            zIndex: 1000,
            padding: 20,
          }}
        >
          <NotificationModal />
        </div>
      )}
    </>
  );
};

export default Header;
