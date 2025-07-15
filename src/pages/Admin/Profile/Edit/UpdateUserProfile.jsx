import React, {useEffect, useState, useCallback} from "react";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import LogoDefault from "../../../../assets/images/defaultlogo.svg";
import Swal from "sweetalert2";
import {Save} from "lucide-react";
import "./indexUpdate.scss";
import {
  Upload,
  Card,
  Avatar,
  Button,
  Input,
  DatePicker,
  Typography,
  Spin,
  Divider,
  Form,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  HomeOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const {Title, Text} = Typography;

const UpdateUserProfile = () => {
  const navigate = useNavigate();
  const storedUserId = localStorage.getItem("userId");
  const userId = useSelector((state) => state.user.userId) || storedUserId;
  const role =
    useSelector((state) => state.user.role) || localStorage.getItem("role");
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/user-profile/${userId}`);
      setUser(res.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "SchoolManagement");
    setError(null);

    const startTime = Date.now();

    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we update your profile image",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/darnrlpag/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");
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
    } catch (error) {
      console.error(error);
      setError("Error uploading image");
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

  const validate = () => {
    const errors = {};
    if (!user.fullName || user.fullName.trim().length < 2) {
      errors.fullName = "Full Name is required (at least 2 characters)";
    }

    const allowedEmailDomains = [
      "@gmail.com",
      "@fpt.edu.vn",
      "@student.fpt.edu.vn",
      "@fe.edu.vn",
      "@fpt.com.vn",
    ];

    const isValidDomain = allowedEmailDomains.some((domain) =>
      user.emailAddress.endsWith(domain)
    );

    if (!user.emailAddress || !isValidDomain) {
      errors.emailAddress = "Email must end with a valid domain";
    }

    if (!user.dateOfBirth) {
      errors.dateOfBirth = "Date of Birth is required";
    } else {
      const today = new Date();
      const dob = new Date(user.dateOfBirth);
      today.setHours(0, 0, 0, 0);
      dob.setHours(0, 0, 0, 0);
      if (dob >= today) {
        errors.dateOfBirth = "Date of Birth must be in the past";
      }
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please check your input!",
        text: Object.values(errors).join("\n"),
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        showClass: {popup: ""},
        hideClass: {popup: ""},
        customClass: {
          popup: "swal2-alert-custom-size",
        },
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        dateOfBirth: user.dateOfBirth,
        avatarUrl: user.avatarUrl,
        address: user.address,
      };

      await axiosInstance.put(`/api/user-profile/${userId}`, payload);

      await Swal.fire({
        icon: "success",
        title: "Update Successfully!",
        text: "Your profile has been updated.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(`/${role}/profile`);
    } catch (error) {
      setError(error);
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: "Unable to save profile information.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setUser((prev) => ({...prev, [name]: value}));
    setFormErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleDateChange = (date, dateString) => {
    setUser((prev) => ({...prev, dateOfBirth: dateString}));
    setFormErrors((prev) => ({...prev, dateOfBirth: undefined}));
  };

  const handleGoBack = () => {
    navigate(`/${role}/profile`);
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

        {/* Profile Form Section */}
        <div style={{padding: "0 32px 32px", marginTop: -20}}>
          <Card
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: 12,
              border: "none",
            }}
            bodyStyle={{padding: "24px"}}
          >
            <Title level={4} style={{marginBottom: 24}}>
              Edit Your Profile
            </Title>

            {error && (
              <div
                style={{
                  background: "#fff2f0",
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 24,
                  border: "1px solid #ffccc7",
                }}
              >
                <Text type="danger">{error.message || error}</Text>
              </div>
            )}

            <Form layout="vertical" onFinish={handleSave}>
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
                  <Form.Item
                    label={
                      <span>
                        <UserOutlined
                          style={{marginRight: 8, color: "#1890ff"}}
                        />
                        Full Name
                      </span>
                    }
                    validateStatus={formErrors.fullName ? "error" : ""}
                    help={formErrors.fullName}
                  >
                    <Input
                      name="fullName"
                      value={user?.fullName || ""}
                      onChange={handleChange}
                      style={{
                        borderRadius: 8,
                        fontSize: 16,
                        padding: "12px 16px",
                      }}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item
                    label={
                      <span>
                        <PhoneOutlined
                          style={{marginRight: 8, color: "#1890ff"}}
                        />
                        Phone Number
                      </span>
                    }
                  >
                    <Input
                      name="phoneNumber"
                      value={user?.phoneNumber || ""}
                      disabled
                      style={{
                        borderRadius: 8,
                        fontSize: 16,
                        padding: "12px 16px",
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                        color: "#595959",
                        borderColor: "#d9d9d9",
                      }}
                    />
                  </Form.Item>
                </div>
                <div>
                  <Form.Item
                    label={
                      <span>
                        <MailOutlined
                          style={{marginRight: 8, color: "#1890ff"}}
                        />
                        Email Address
                      </span>
                    }
                    validateStatus={formErrors.emailAddress ? "error" : ""}
                    help={formErrors.emailAddress}
                  >
                    <Input
                      name="emailAddress"
                      value={user?.emailAddress || ""}
                      onChange={handleChange}
                      style={{
                        borderRadius: 8,
                        fontSize: 16,
                        padding: "12px 16px",
                      }}
                      placeholder="Enter your email address"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item
                    label={
                      <span>
                        <CalendarOutlined
                          style={{marginRight: 8, color: "#1890ff"}}
                        />
                        Date of Birth
                      </span>
                    }
                    validateStatus={formErrors.dateOfBirth ? "error" : ""}
                    help={formErrors.dateOfBirth}
                  >
                    <DatePicker
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        fontSize: 16,
                        padding: "12px 16px",
                      }}
                      value={user?.dateOfBirth ? dayjs(user.dateOfBirth) : null}
                      onChange={handleDateChange}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </div>

                <div style={{gridColumn: "span 2"}}>
                  <Form.Item
                    label={
                      <span>
                        <HomeOutlined
                          style={{marginRight: 8, color: "#1890ff"}}
                        />
                        Address
                      </span>
                    }
                    validateStatus={formErrors.address ? "error" : ""}
                    help={formErrors.address}
                  >
                    <Input
                      name="address"
                      value={user?.address || ""}
                      onChange={handleChange}
                      style={{
                        borderRadius: 8,
                        fontSize: 16,
                        padding: "12px 16px",
                      }}
                      placeholder="Enter your address"
                    />
                  </Form.Item>
                </div>
              </div>

              <Divider style={{margin: "24px 0"}} />

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined style={{marginRight: 8}} />}
                  onClick={handleGoBack}
                  style={{
                    borderRadius: 8,
                    height: 48,
                    fontSize: 16,
                    padding: "0 24px",
                  }}
                >
                  Back
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={saving}
                  icon={
                    <Save color="#ffffff" size={18} style={{marginRight: 8}} />
                  }
                  style={{
                    borderRadius: 8,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 500,
                    background:
                      "linear-gradient(90deg, #355383 0%, #355383 100%)",
                    border: "none",
                    width: "200px",
                  }}
                  className="edit-profile-button"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default UpdateUserProfile;
