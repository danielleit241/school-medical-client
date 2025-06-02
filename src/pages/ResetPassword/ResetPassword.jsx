import React, {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import axiosInstance from "../../api/axios";
import "./index.scss";
import {useSelector} from "react-redux";
import Swal from "sweetalert2";
import {useLocation, useNavigate} from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy phoneNumber từ redux hoặc location.state
  const phoneNumberRedux = useSelector(
    (state) => state.userProfile?.phoneNumber
  );
  const phoneNumberState = location.state?.phoneNumber;
  const [phoneNumber, setPhoneNumber] = useState(
    phoneNumberRedux || phoneNumberState || ""
  );

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("New password must be different from old password.");
      return;
    }
    if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
      setError("Phone number is required and must be 10-11 digits.");
      return;
    }
    const data = {
      phoneNumber,
      oldPassword,
      newPassword,
      confirmNewPassword,
    };
    console.log("Data gửi đi:", data);
    try {
      const response = await axiosInstance.post(
        "/api/auth/change-password",
        data
      );

      setSuccess(response.data.message || "Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message || "Password changed successfully.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate(-1); // Quay lại trang trước đó
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Phone number or password is incorrect."
      );
      return;
    }
    console.log(phoneNumber);
  };
  return (
    <>
      <div className="reset_main">
        <div className="reset_form">
          <h2 className="reset_name">Reset Password</h2>
          <div className="reset_message">
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
          </div>
          <form onSubmit={handleReset}>
            <div className="reset_form__input">
              <label>Phone Number:</label>
              <input
                type="text"
                value={phoneNumber}
                name="phoneNumber"
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
                disabled={!!(phoneNumberRedux || phoneNumberState)}
                style={
                  phoneNumberRedux || phoneNumberState
                    ? {background: "#f0f0f0"}
                    : {}
                }
              />
            </div>
            <div className="reset_form__input-password">
              <div
                className="reset_form__eye"
                onClick={() => setShowPassword(!showPassword)}
                style={{cursor: "pointer"}}
              >
                {showPassword ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Hide password
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Show password
                  </p>
                )}
              </div>
              <div className="reset_form__input">
                <label>Old Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  name="oldPassword"
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>
            <div className="reset_form__input">
              <label>New Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                name="newPassword"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="reset_form__input">
              <label>Confirm New Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmNewPassword}
                name="confirmNewPassword"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <div className="flex justify-center items-center gap-4">
              <button
                type="submit"
                className="font-[550] px-4"
                style={{minWidth: 140}}
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="font-[550] px-4"
                style={{minWidth: 140}}
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
