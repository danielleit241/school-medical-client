import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {useNavigate} from "react-router-dom";
import LogoDefault from "../../../../assets/images/defaultlogo.svg";
import Swal from "sweetalert2";
import {Pencil} from "lucide-react";
import {
  Upload,
  Card,
  Avatar,
  Button,
  Input,
  Space,
  Typography,
  Spin,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const {Title, Text} = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const storedUserId = localStorage.getItem("userId");
  const userId = useSelector((state) => state.user.userId) || storedUserId;
  const role =
    useSelector((state) => state.user.role) || localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!userId || !token) {
      console.error("User ID or token is missing");
      return;
    }
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/user-profile/${userId}`);
        setUser(response.data);
        console.log("User profile fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "SchoolManagement");

    const startTime = Date.now();

    try {
      // Show loading indicator
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we update your profile image",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      // Upload to Cloudinary
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/darnrlpag/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await axiosInstance.put(`/api/user-profile/${userId}/avatar`, {
        avatarUrl: data.secure_url,
      });

      setUser((prev) => ({...prev, avatarUrl: data.secure_url}));

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Profile image updated!`,
        text: `Upload time: ${duration} seconds`,
        showConfirmButton: false,
        timer: 2200,
        showClass: {popup: ""},
        hideClass: {popup: ""},
        customClass: {
          popup: "swal2-alert-custom-size",
        },
      });

      setTimeout(() => {
        window.location.reload();
      }, 2300);
    } catch (error) {
      console.error(error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Upload failed!",
        text: "Could not update profile image.",
        showConfirmButton: false,
        timer: 2000,
        showClass: {popup: ""},
        hideClass: {popup: ""},
        customClass: {
          popup: "swal2-alert-custom-size",
        },
      });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Spin size="large" tip="Loading your profile..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 800,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "none",
          overflow: "hidden",
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        {/* Profile Header Section */}
        <div
          style={{
            background: "linear-gradient(180deg, #1890ff 0%, #355383 100%)",
            padding: "32px 24px 60px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{position: "relative", display: "inline-block"}}>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                padding: 8,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
              }}
            >
              <Avatar
                size={120}
                src={
                  user?.avatarUrl && user.avatarUrl.trim() !== ""
                    ? user.avatarUrl
                    : LogoDefault
                }
                icon={<UserOutlined />}
                style={{
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Upload
                showUploadList={false}
                accept="image/*"
                customRequest={({file}) => {
                  handleUpload({target: {files: [file]}});
                }}
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined style={{fontSize: 10, margin: 0}} />}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eee",
                    transition: "all 0.3s ease",
                  }}
                  className="avatar-upload-button"
                />
              </Upload>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div style={{padding: "0 32px 32px", marginTop: -20}}>
          <Card
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: 12,
              border: "none",
            }}
            bodyStyle={{padding: "24px"}}
          >
            {/* Replace Space with a grid layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
                width: "100%",
              }}
            >
              {/* Full Name */}
              <div>
                <Text
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#8c8c8c",
                    fontSize: 15, 
                  }}
                >
                  <UserOutlined style={{marginRight: 8, color: "#1890ff"}} />
                  Full Name
                </Text>
                <Input
                  value={user?.fullName || "N/A"}
                  readOnly
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    backgroundColor: "#fafafa",
                    fontSize: 16, 
                    padding: "12px 16px",
                    color: user?.fullName ? "#000" : "#8c8c8c",
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Text
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#8c8c8c",
                    fontSize: 15, 
                  }}
                >
                  <PhoneOutlined style={{marginRight: 8, color: "#1890ff"}} />
                  Phone Number
                </Text>
                <Input
                  value={user?.phoneNumber || "N/A"}
                  readOnly
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    backgroundColor: "#fafafa",
                    fontSize: 16, 
                    padding: "12px 16px",
                    color: user?.phoneNumber ? "#000" : "#8c8c8c",
                  }}
                />
              </div>

              {/* Email Address */}
              <div>
                <Text
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#8c8c8c",
                    fontSize: 15,
                  }}
                >
                  <MailOutlined style={{marginRight: 8, color: "#1890ff"}} />
                  Email Address
                </Text>
                <Input
                  value={user?.emailAddress || "N/A"}
                  readOnly
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    backgroundColor: "#fafafa",
                    fontSize: 16, 
                    padding: "12px 16px",
                    color: user?.emailAddress ? "#000" : "#8c8c8c",
                  }}
                />
              </div>

              {/* Day of Birth */}
              <div>
                <Text
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#8c8c8c",
                    fontSize: 15, 
                  }}
                >
                  <CalendarOutlined
                    style={{marginRight: 8, color: "#1890ff"}}
                  />
                  Day of Birth
                </Text>
                <Input
                  value={formatDate(user?.dateOfBirth) || "N/A"}
                  readOnly
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    backgroundColor: "#fafafa",
                    fontSize: 16, 
                    padding: "12px 16px",
                    color: user?.dateOfBirth ? "#000" : "#8c8c8c",
                  }}
                />
              </div>

              {/* Address - Spans both columns */}
              <div style={{gridColumn: "span 2"}}>
                <Text
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#8c8c8c",
                    fontSize: 15, 
                  }}
                >
                  <HomeOutlined style={{marginRight: 8, color: "#1890ff"}} />
                  Address
                </Text>
                <Input
                  value={user?.address || "N/A"}
                  readOnly
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    backgroundColor: "#fafafa",
                    fontSize: 16, 
                    padding: "12px 16px",
                    color: user?.address ? "#000" : "#8c8c8c",
                  }}
                />
              </div>
            </div>

            <Divider style={{margin: "24px 0"}} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                type="link"
                icon={<LockOutlined />}
                onClick={() => navigate(`/${role}/resetpassword`)}
                style={{
                  color: "#8c8c8c",
                  fontSize: 16, 
                  height: "auto",
                }}
              >
                Reset Password
              </Button>

              <Button
                type="primary"
                size="large"
                icon={
                  <Pencil color="#ffffff" size={18} style={{marginRight: 8}} />
                }
                onClick={() => navigate("update")}
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: 16, 
                  fontWeight: 500,
                  background:
                    "linear-gradient(90deg, #355383 0%, #355383 100%)",
                  border: "none",
                  width: "200px",
                }}
                className="edit-profile-button"
              >
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export default UserProfile;
