import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Menu, Badge} from "antd";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  SolutionOutlined,
  FileTextOutlined,
  FormOutlined,
  ProfileOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  AppstoreAddOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import axiosInstance from "../../api/axios";
import {setUserInfo} from "../../redux/feature/userSlice";
import "./index.scss";

const Sidebar = () => {
  const role = useSelector((state) => state.user.role);
  const userId = useSelector((state) => state.user.userId);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
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
          fetchUnread();
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
        label: "Campaign",
        key: "campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Campaign List",
            key: "/admin/campaign/campaign-list",
            link: "/admin/campaign/campaign-list",
            icon: <FileTextOutlined />,
          },
          {
            label: "Create Campaign",
            key: "/admin/campaign/create-campaign",
            link: "/admin/campaign/create-campaign",
            icon: <FileAddOutlined />,
          },
          {
            label: "Detail Campaign",
            key: "/admin/campaign/detail-campaign",
            link: "/admin/campaign/detail-campaign",
            icon: <FileSearchOutlined />,
          },
          {
            label: "History Campaign",
            key: "/admin/campaign/history-campaign",
            link: "/admin/campaign/history-campaign",
            icon: <FileDoneOutlined />,
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
        icon: <AppstoreAddOutlined />,
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
        label: "Profile",
        key: "/admin/profile",
        icon: <ProfileOutlined />,
        link: "/admin/profile",
      },
    ],
    manager: [
      {
        label: "Dashboard",
        key: "/admin",
        icon: <DashboardOutlined />,
        link: "/admin",
      },
      {
        label: "Campaign",
        key: "campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Campaign List",
            key: "/admin/campaign/campaign-list",
            link: "/admin/campaign/campaign-list",
            icon: <FileTextOutlined />,
          },
          {
            label: "Create Campaign",
            key: "/admin/campaign/create-campaign",
            link: "/admin/campaign/create-campaign",
            icon: <FileAddOutlined />,
          },
          {
            label: "Detail Campaign",
            key: "/admin/campaign/detail-campaign",
            link: "/admin/campaign/detail-campaign",
            icon: <FileSearchOutlined />,
          },
          {
            label: "History Campaign",
            key: "/admin/campaign/history-campaign",
            link: "/admin/campaign/history-campaign",
            icon: <FileDoneOutlined />,
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
        icon: <AppstoreAddOutlined />,
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
        label: "Profile",
        key: "/admin/profile",
        icon: <ProfileOutlined />,
        link: "/admin/profile",
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
        label: "Campaign",
        key: "campaign",
        icon: <CalendarOutlined />,
        dropdown: [
          {
            label: "Campaign List",
            key: "/nurse/campaign/campaign-list",
            link: "/nurse/campaign/campaign-list",
            icon: <FileTextOutlined />,
          },
          {
            label: "Detail Campaign",
            key: "/nurse/campaign/detail-campaign",
            link: "/nurse/campaign/detail-campaign",
            icon: <FileSearchOutlined />,
          },
          {
            label: "History Campaign",
            key: "/nurse/campaign/history-campaign",
            link: "/nurse/campaign/history-campaign",
            icon: <FileDoneOutlined />,
          },
          {
            label: "Record Form",
            key: "/nurse/campaign/record-form",
            link: "/nurse/campaign/record-form",
            icon: <FormOutlined />,
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
      {
        label: "Notification",
        key: "/nurse/notification",
        icon: <ProfileOutlined />,
        link: "/nurse/notification",
      },
      {
        label: "Profile",
        key: "/nurse/profile",
        icon: <ProfileOutlined />,
        link: "/nurse/profile",
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
        label: "Health Declaration",
        key: "health-declaration",
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
        dropdown: [
          {
            label: "My Children",
            key: "/parent/medical-event/my-children",
            link: "/parent/medical-event/my-children",
            icon: <FileAddOutlined />,
          },
          {
            label: "Children List",
            key: "/parent/medical-event/children-list",
            link: "/parent/medical-event/children-list",
            icon: <FileTextOutlined />,
          },
          {
            label: "Children Detail",
            key: "/parent/medical-event/children-detail",
            link: "/parent/medical-event/children-detail",
            icon: <FileSearchOutlined />,
          },
        ],
      },
      {
        label: "Notification",
        key: "/parent/notification",
        icon: <ProfileOutlined />,
        link: "/parent/notification",
      },
      {
        label: "Profile",
        key: "/parent/profile",
        icon: <ProfileOutlined />,
        link: "/parent/profile",
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

  // control bell notification
  const handleBellClick = async () => {
    try {
      await axiosInstance.put(`/api/users/${userId}/notifications`);
      setUnreadCount(0);
    } catch (err) {console.log(err);}
    // dien đến trang notification tương ứng với role
    if (role === "parent") navigate("/parent/notification", { state: { reload: Date.now() } });
    else if (role === "nurse") navigate("/nurse/notification", { state: { reload: Date.now() } });
    else if (role === "admin") navigate("/admin/notification", { state: { reload: Date.now() } });
    else if (role === "manager") navigate("/manager/notification", { state: { reload: Date.now() } });
  };

  return (
    <div style={{width: 250, height: "100vh", background: "#fff"}}>
      {/* Hiển thị Hello, role và Logout nếu là admin, manager, nurse */}
      {(role === "admin" || role === "manager" || role === "nurse") && (
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{fontWeight: "bold"}}>Hello, {role}</span>
              {/* Bell notification */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px 0",
            }}
          >
            <Badge count={unreadCount}>
              <BellOutlined
                style={{fontSize: 20, color: "#1890ff", cursor: "pointer"}}
                onClick={handleBellClick}
              />
            </Badge>
          </div>
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </div>
      )}

     

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        style={{height: "100%", borderRight: 0}}
      >
        {renderMenuItems(menuItems)}
      </Menu>
    </div>
  );
};

export default Sidebar;
