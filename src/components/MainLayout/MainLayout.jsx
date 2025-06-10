import React from "react";
import {Layout} from "antd";
import {Outlet} from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import SystemHeader from "../SystemHeader/SystemHeader"; // Thêm dòng này
import {useSelector} from "react-redux";

const {Content, Sider} = Layout;

const MainLayout = () => {
  // Lấy role từ Redux hoặc localStorage
  const role =
    useSelector((state) => state.user.role) || localStorage.getItem("role");

  return (
    <Layout
      style={{
        minHeight: "100vh",
        flexDirection: "column",
        zIndex: 0,
      }}
    >
      {/* SystemHeader phía trên cùng */}
      {(role === "admin" || role === "manager" || role === "nurse") && (
        <div>
          <SystemHeader
            style={{
              boxShadow: "0 2px 8px 0 rgba(53,83,131,0.10)",
              zIndex: 10,
            }}
          />
        </div>
      )}
      {/* Main content with sidebar and outlet */}
      <div style={{display: "flex", flex: 1, minHeight: 0}}>
        <Sidebar />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding:
                role === "admin" || role === "manager" || role === "nurse"
                  ? "50px"
                  : "20px",
              background: "#F8F8F8",
              zIndex: 1,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MainLayout;
