import React, {useEffect, useState, useRef} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Menu, Badge, Avatar, Dropdown} from "antd";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  SolutionOutlined,
  FileTextOutlined,
  FormOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  AppstoreAddOutlined,
  BellOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import axiosInstance from "../../api/axios";
import {setUserInfo} from "../../redux/feature/userSlice";
import LogoDefault from "../../assets/images/defaultlogo.svg";
import "./index.scss";
import NotificationModal from "../Notification/NotificationModal";
import {RiArrowDownSFill} from "react-icons/ri";
import {LuSyringe} from "react-icons/lu";
import {Bell, LogOut, User} from "lucide-react";

const Sidebar = () => {
  const role = useSelector((state) => state.user.role);
  const userId = useSelector((state) => state.user.userId);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0); // Để kiểm tra số lượng chưa đọc trước đó
  const [user, setUser] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationRef = useRef(null);
  const avatarContainerRef = useRef(null);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    // Lấy user profile
    const fetchUserProfile = async () => {
      if (!userId) return;
      try {
        const response = await axiosInstance.get(`/api/user-profile/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
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
          const prevCount = unreadCountRef.current;
          await fetchUnread();
          // Chỉ phát âm thanh khi có thông báo mới (số lượng chưa đọc tăng lên)
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

  // Xác định menu được chọn và mở dựa trên location hiện tại
  const menuItemsByRole = {
    admin: [
      {
        label: "Dashboard",
        key: "/admin",
        icon: <DashboardOutlined />,
        link: "/admin",
      },
      {
        label: "Account Management",
        key: "account-management",
        icon: <UserOutlined />,
        dropdown: [
          {
            label: "List User",
            key: "/admin/account-management/list-user",
            link: "/admin/account-management/list-user",
            icon: <TeamOutlined />,
          },
        ],
      },
      {
        label: "Vaccine Campaign",
        key: "vaccine-campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Create Campaign",
            key: "/admin/vaccine/create-campaign",
            link: "/admin/vaccine/create-campaign",
            icon: <FileAddOutlined />,
          },
          {
            label: "Vaccine Schedule List",
            key: "/admin/vaccine/vaccine-schedule",
            link: "/admin/vaccine/vaccine-schedule",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Health Check",
        key: "health-check",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Create Health Check",
            key: "/admin/health-check/create",
            link: "/admin/health-check/create",
            icon: <FileAddOutlined />,
          },
          {
            label: "Health Check Schedule List",
            key: "/admin/health-check/schedules",
            link: "/admin/health-check/schedules",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Student Management",
        key: "student-management",
        icon: <TeamOutlined />,
        dropdown: [
          {
            label: "Add Student",
            key: "/admin/student-management/add-student",
            link: "/admin/student-management/add-student",
            icon: <UserOutlined />,
          },
          {
            label: "Student List",
            key: "/admin/student-management/student-list",
            link: "/admin/student-management/student-list",
            icon: <TeamOutlined />,
          },
        ],
      },
      {
        label: "Medical Inventory",
        key: "inventory",
        icon: <DatabaseOutlined />,
        dropdown: [
          {
            label: "Create Inventory",
            key: "/admin/inventory/createInventory",
            link: "/admin/inventory/createInventory",
            icon: <FileAddOutlined />,
          },
          {
            label: "Inventory List",
            key: "/admin/inventory/inventoryList",
            link: "/admin/inventory/inventoryList",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Vaccine Management",
        key: "vaccine-management",
        icon: <MedicineBoxOutlined />,
        dropdown: [
          {
            label: "Create Vaccine",
            key: "/admin/vaccine/create",
            link: "/admin/vaccine/create",
            icon: <FileAddOutlined />,
          },
          {
            label: "Vaccine List",
            key: "/admin/vaccine/inventoryList",
            link: "/admin/vaccine/inventoryList",
            icon: <FileTextOutlined />,
          },
        ],
      },
    ],
    manager: [
      {
        label: "Dashboard",
        key: "/manager",
        icon: <DashboardOutlined />,
        link: "/manager",
      },
      {
        label: "Vaccine Campaign",
        key: "vaccine-campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Create Vaccine Campaign",
            key: "/manager/vaccine/create-campaign",
            link: "/manager/vaccine/create-campaign",
            icon: <FileAddOutlined />,
          },
          {
            label: "Vaccine Schedule List",
            key: "/manager/vaccine/vaccine-schedule",
            link: "/manager/vaccine/vaccine-schedule",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Health Check",
        key: "health-check",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Create Health Check",
            key: "/manager/health-check/create",
            link: "/manager/health-check/create",
            icon: <FileAddOutlined />,
          },
          {
            label: "Health Check Schedule List",
            key: "/manager/health-check/schedules",
            link: "/manager/health-check/schedules",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Student Management",
        key: "student-management",
        icon: <TeamOutlined />,
        dropdown: [
          {
            label: "Add Student",
            key: "/manager/student-management/add-student",
            link: "/manager/student-management/add-student",
            icon: <UserOutlined />,
          },
          {
            label: "Student List",
            key: "/manager/student-management/student-list",
            link: "/manager/student-management/student-list",
            icon: <TeamOutlined />,
          },
        ],
      },
      {
        label: "Medical Inventory",
        key: "inventory",
        icon: <AppstoreAddOutlined />,
        dropdown: [
          {
            label: "Create Inventory",
            key: "/manager/inventory/createInventory",
            link: "/manager/inventory/createInventory",
            icon: <FileAddOutlined />,
          },
          {
            label: "Inventory List",
            key: "/manager/inventory/inventoryList",
            link: "/manager/inventory/inventoryList",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Vaccine Management",
        key: "vaccine-management",
        icon: <AppstoreAddOutlined />,
        dropdown: [
          {
            label: "Create Vaccine",
            key: "/manager/vaccine/createVaccine",
            link: "/manager/vaccine/create",
            icon: <FileAddOutlined />,
          },
          {
            label: "Vaccine List",
            key: "/manager/vaccine/inventoryList",
            link: "/manager/vaccine/inventoryList",
            icon: <FileTextOutlined />,
          },
        ],
      },
    ],
    nurse: [
      {
        label: "Dashboard",
        key: "/nurse",
        icon: <DashboardOutlined />,
        link: "/nurse",
      },
      {
        label: "Appointment Management",
        key: "appointment-management",
        link: "/nurse/appointment-management/appointment-list",
        icon: <FileTextOutlined />,
      },
      {
        label: "Vaccine Campaign",
        key: "vaccine-campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Vaccine Campaign List",
            key: "/nurse/vaccine/campaign-list",
            link: "/nurse/vaccine/campaign-list",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Health Check",
        key: "health-check",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Health Check Campaign",
            key: "/nurse/health-check/list",
            link: "/nurse/health-check/list",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Medical Event",
        key: "medical-event",
        icon: <MedicineBoxOutlined />,
        dropdown: [
          {
            label: "Create Medical Event",
            key: "/nurse/medical-event/create-medical-event",
            link: "/nurse/medical-event/create-medical-event",
            icon: <FileAddOutlined />,
          },
          {
            label: "Medical Event List",
            key: "/nurse/medical-event/medical-event-list",
            link: "/nurse/medical-event/medical-event-list",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Medical Received",
        key: "medical-received",
        icon: <MedicineBoxOutlined />,
        link: "/nurse/medical-received/medical-received-list",
      },
    ],

    parent: [
      {
        label: "Home",
        key: "/parent",
        icon: <HomeOutlined />,
        link: "/parent",
      },
      {
        label: "Timetable",
        key: "timetable",
        icon: <LuSyringe size={20} />,
        link: "/parent/timetable",
      },
      {
        label: "Appointment",
        key: "appointment",
        icon: <SolutionOutlined />,
        dropdown: [
          {
            label: "Appointment List",
            key: "/parent/appointments-list",
            link: "/parent/appointments-list",
            icon: <FileTextOutlined />,
          },
          {
            label: "Appointment History",
            key: "/parent/appointment-history",
            link: "/parent/appointment-history",
            icon: <FileDoneOutlined />,
          },
        ],
      },
      {
        label: "Health Profile",
        key: "health-profile",
        icon: <FileTextOutlined />,
        dropdown: [
          {
            label: "My Children",
            key: "/parent/health-declaration/my-children",
            link: "/parent/health-declaration/my-children",
            icon: <TeamOutlined />,
          },
        ],
      },
      {
        label: "Medical Registration",
        key: "medical-registration",
        icon: <SolutionOutlined />,
        dropdown: [
          {
            label: "Create Medical Registration",
            key: "/parent/medical-registration/create",
            link: "/parent/medical-registration/create",
            icon: <FileAddOutlined />,
          },
          {
            label: "Medical Registration List",
            key: "/parent/medical-registration/list",
            link: "/parent/medical-registration/list",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        label: "Medical Event",
        key: "/parent/medical-event",
        icon: <MedicineBoxOutlined />,
        link: "/parent/medical-event/children-list",
      },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

  const renderMenuItems = (items) =>
    items.map((item) => {
      if (item.dropdown) {
        return (
          <Menu.SubMenu key={item.key} title={item.label} icon={item.icon}>
            {item.dropdown.map((sub) => (
              <Menu.Item key={sub.key} icon={sub.icon}>
                <Link to={sub.link}>{sub.label}</Link>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={item.link}>{item.label}</Link>
        </Menu.Item>
      );
    });

  const selectedKeys = [];
  const openKeys = [];

  menuItems.forEach((item) => {
    if (item.dropdown) {
      item.dropdown.forEach((sub) => {
        if (location.pathname === sub.link) {
          selectedKeys.push(sub.key);
          openKeys.push(item.key);
        }
      });
    } else {
      if (location.pathname === item.link) {
        selectedKeys.push(item.key);
      }
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    dispatch(setUserInfo({role: null, userId: null}));
    navigate("/login");
  };

  // Hàm xử lý khi click vào Notification trong dropdown
  const handleNotificationClick = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setUnreadCount(0);
      unreadCountRef.current = 0;
    } catch (err) {
      console.log(err);
    }
    setIsNotificationModalOpen(true);
  };

  // Đóng modal khi click ra ngoài
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

  // Dropdown menu cho avatar
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

  return (
    <div
      style={{
        background: "#fff",
      }}
    >
      {/* Hiển thị Hello, role, avatar, notification giống Header */}
      {(role === "admin" || role === "manager" || role === "nurse") && (
        <div
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-start", // Changed to right-align all elements
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          {/* Remove the Hello text from here and put in dropdown */}

          {/* Icons and avatar on the right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginRight: 10,
            }}
          >
            {/* Avatar with dropdown containing Hello greeting and logout */}
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
                      user && user.avatarUrl && user.avatarUrl.trim() !== ""
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
          </div>

          {/* Keep the notification modal */}
          {isNotificationModalOpen && (
            <div
              ref={notificationRef}
              className="notification-dropdown"
              style={{
                position: "absolute",
                top: 60,
                right: 0,
                left: 30,
                width: 350,
                background: "#fff",
                borderRadius: 10,
                zIndex: 1000,
                padding: 0,
                transition: "opacity 0.3s, transform 0.3s",
                opacity: 1,
                transform: "translateY(0)",
              }}
            >
              <NotificationModal />
            </div>
          )}
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        style={{
          borderRight: 0,
          fontSize: 16,
          fontFamily: "'Ubuntu', sans-serif !important",
          paddingLeft: 4,
          paddingRight: 4,
          letterSpacing: 0.3,
          minWidth: 350,
        }}
      >
        {renderMenuItems(menuItems)}
      </Menu>
    </div>
  );
};

export default Sidebar;
