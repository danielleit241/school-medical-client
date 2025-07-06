import {useEffect, useRef, useState} from "react";
import "./Header.scss";
import {NavLink, useNavigate} from "react-router-dom";
import HeaderLogoTop from "../../assets/images/Medical.svg";
import HeaderLogoBottom from "../../assets/images/Black Modern Medical Logo.svg";
import Call_Icon from "../../assets/images/Call_Icon.svg";
import Clock_Icon from "../../assets/images/Clock_Icon.svg";
import Location_Icon from "../../assets/images/Location_Icon.svg";
import {useSelector} from "react-redux";
import {Badge, Dropdown, Avatar, Menu} from "antd";
import {LogoutOutlined} from "@ant-design/icons";
import {RiArrowDownSFill} from "react-icons/ri";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import axiosInstance from "../../api/axios";
import LogoDefault from "../../assets/images/defaultlogo.svg";
import NotificationModal from "../Notification/NotificationModal";
import {User, Bell, ShieldQuestion} from "lucide-react";

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
  const avatarContainerRef = useRef(null);
  const [totalHealthDeclarations, setTotalHealthDeclarations] = useState(0);

  useEffect(() => {
    const fetchHealthDeclarations = async () => {
      if (!userId) return;
      try {
        const response = await axiosInstance.get(
          `/api/parents/${userId}/students/total-health-declarations`
        );
        setTotalHealthDeclarations(response.data);
      } catch (error) {
        console.error("Error fetching health declarations:", error);
      }
    };
    fetchHealthDeclarations();
  }, [userId]);

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
      <Menu.Item
        key="greeting"
        disabled
        style={{cursor: "default", color: "#333", fontWeight: "500"}}
      >
        Hello, {role}
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
        !notificationRef.current.contains(event.target) &&
        avatarContainerRef.current &&
        !avatarContainerRef.current.contains(event.target)
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
        <div className="header__top flex justify-around items-center p-2.5 ">
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
              <li className="header__bottom-item relative">
                <div className="absolute right-[-10px] top-[-10px]">
                  {totalHealthDeclarations > 0 && (
                    <Badge
                      size="small"
                      count={totalHealthDeclarations}
                      style={{
                        backgroundColor: "red",
                        color: "#fff",
                        fontSize: 0,
                        minWidth: 10,
                        height: 10,
                      }}
                    />
                  )}
                </div>
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
              <div className="flex items-center gap-4">
                {/* Remove the "Hello, role" text from here as it will be in the dropdown */}

                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                  {/* Guide */}
                  {role === "parent" && (
                    <div
                      onClick={() => navigate(`/guide`)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        border: "1px solid #eee",
                        padding: 10,
                        borderRadius: "50%",
                      }}
                    >
                      <ShieldQuestion size={25} color="#666" />
                      {/* <User size={25} color="#666" /> */}
                    </div>
                  )}

                  {/* Notification Button */}
                  <div
                    onClick={handleNotificationClick}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      backgroundColor: "#fff",
                      border: "1px solid #eee",
                      padding: 10,
                      borderRadius: "50%",
                    }}
                  >
                    <Badge count={unreadCount} size="small" offset={[-2, -2]}>
                      <Bell size={25} color="#666" />
                    </Badge>
                  </div>

                  {/* User Profile Button */}
                  <div
                    onClick={() => navigate(`/${role}/profile`)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#fff",
                      border: "1px solid #eee",
                      padding: 10,
                      borderRadius: "50%",
                    }}
                  >
                    <User size={25} color="#666" />
                  </div>

                  {/* Avatar with dropdown */}
                  <div
                    ref={avatarContainerRef}
                    style={{
                      display: "flex",
                      position: "relative",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Dropdown overlay={menu} trigger={["click"]}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        <Avatar
                          size={50}
                          src={
                            user &&
                            user.avatarUrl &&
                            user.avatarUrl.trim() !== ""
                              ? user.avatarUrl
                              : LogoDefault
                          }
                          style={{
                            cursor: "pointer",
                            border: "2px solid #eee",
                          }}
                        />
                        <RiArrowDownSFill
                          style={{
                            fontSize: 16,
                            marginLeft: 4,
                            color: "#aaa",
                            position: "absolute",
                            bottom: -3,
                            right: 0,
                            backgroundColor: "#F8F8F8",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                    </Dropdown>
                  </div>
                </div>
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
            top: 150,
            right: 90,
            width: 350,
            background: "#fff",
            borderRadius: 10,
            zIndex: 1000,
            padding: 0,
            transition: "opacity 0.3s, transform 0.3s",
            opacity: 1,
            transform: "translateY(0)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <NotificationModal />
        </div>
      )}
    </>
  );
};

export default Header;
