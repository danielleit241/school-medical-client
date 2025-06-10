import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {useState} from "react";
import axiosInstance from "../../../../api/axios";
import "./index.scss";
import {useNavigate} from "react-router-dom";
import LogoDefault from "../../../../assets/images/defaultlogo.svg";
import Swal from "sweetalert2";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
        const response = await axiosInstance.get(`/api/user-profile/${userId}`);
        setUser(response.data);
        console.log("User profile fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
      // Upload lên Cloudinary
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/darnrlpag/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      // Gọi API backend để cập nhật avatar
      await axiosInstance.put(`/api/user-profile/${userId}/avatar`, {
        avatarUrl: data.secure_url,
      });

      setUser((prev) => ({ ...prev, avatarUrl: data.secure_url }));

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
        showClass: { popup: "" },
        hideClass: { popup: "" },
        customClass: {
          popup: "swal2-alert-custom-size",
        },
      });
      window.location.reload(); // Reload page to reflect changes
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
        showClass: { popup: "" },
        hideClass: { popup: "" },
        customClass: {
          popup: "swal2-alert-custom-size",
        },
      });
    }
  };

  return (
    <>
      {!user ? (
        <div>Loading...</div>
      ) : (
        <div className="profile_main">
          <div className="profile_image no-upload" style={{ position: "relative", display: "inline-block" }}>
            <img
              src={
                user.avatarUrl && user.avatarUrl.trim() !== ""
                  ? user.avatarUrl
                  : LogoDefault
              }
              alt="img2"
              style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
            />
            <Upload
              showUploadList={false}
              accept="image/*"
              customRequest={({ file }) => {
                // Tạo 1 event giả để dùng lại handleUpload
                handleUpload({ target: { files: [file] } });
              }}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "#fff",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 4px #ccc",
                  cursor: "pointer",
                }}
                title="Upload avatar"
              >
                <PlusOutlined style={{ fontSize: 18, color: "#1677ff" }} />
              </div>
            </Upload>
          </div>
          <h2>Hello {user.fullName}</h2>
          <div className="profile_form flex flex-col justify-center items-center relative">
            <div className="profile_input_1">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={user.fullName}
                readOnly
              />
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={user.phoneNumber}
                readOnly
              />
              <label>Email Address</label>
              <input
                type="emailAddress"
                name="emailAddress"
                value={user.emailAddress}
                readOnly
              />
              <label>Day of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={user.dateOfBirth}
                readOnly
              />
              <label>Address</label>
              <input type="text" name="address" value={user.address} readOnly />
            </div>
            <div className="login_form__forget">
              <span
                style={{
                  position: "absolute",
                  bottom: 40,
                  left: 130,
                  cursor: "pointer",
                  color: "#aaa",
                  textDecoration: "underline",
                }}
                onClick={() => navigate(`/${role}/resetpassword`)}
              >
                Reset password
              </span>
            </div>
            <div className="buttons">
              <button type="button" onClick={() => navigate("update")}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
