import React, {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import axiosInstance from "../../api/axios";
import "./index.scss";
import {useSelector} from "react-redux";
import Swal from "sweetalert2";
import {useLocation, useNavigate} from "react-router-dom";
import {CircleCheck} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordWarning, setPasswordWarning] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

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

    // Validate phone number
    if (!/^\d{10,11}$/.test(phoneNumber)) {
      setError("Phone number must be 10-11 digits.");
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("New password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("New password must contain at least one special character.");
      return;
    }

    // Confirm password match
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from old password.");
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

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordWarning({
      length: value.length >= 6,
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
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
            <div className="reset_form__input relative">
              <label>New Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                name="newPassword"
                onChange={handleNewPasswordChange}
                placeholder="Enter new password"
                required
                onFocus={() => setShowPasswordGuide(true)}
                onBlur={() => setShowPasswordGuide(false)}
                style={{position: "relative"}}
              />
              {/* Password guide popup */}
              {showPasswordGuide && (
                <div
                  style={{
                    position: "absolute",
                    top: 25,
                    left: "100%",
                    zIndex: 10,
                    background: "#fff",
                    border: "1px solid #e0e7ef",
                    borderRadius: 8,
                    padding: "14px 22px",
                    minWidth: 300,
                    fontSize: 14,
                    color: "#222",
                    filter: "drop-shadow(0 2px 8px #e0e7ef)",
                  }}
                >
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: -12,
                      width: 0,
                      height: 0,
                      borderTop: "10px solid transparent",
                      borderBottom: "10px solid transparent",
                      borderRight: "12px solid #fff",
                      filter: "drop-shadow(-1px 0 0 #e0e7ef)",
                      zIndex: 11,
                    }}
                  />
                  <div style={{fontWeight: 600, marginBottom: 6}}>Sử dụng:</div>
                  <ul style={{paddingLeft: 20, margin: 0, listStyle: "none"}}>
                    <li
                      style={{
                        color: passwordWarning.length ? "#16a34a" : "#888",
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircleCheck
                        size={18}
                        color={passwordWarning.length ? "#16a34a" : "#888"}
                        style={{minWidth: 18}}
                      />
                      8 - 64 characters
                    </li>
                    <li
                      style={{
                        color: passwordWarning.uppercase ? "#16a34a" : "#888",
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircleCheck
                        size={18}
                        color={passwordWarning.uppercase ? "#16a34a" : "#888"}
                        style={{minWidth: 18}}
                      />
                      Uppercase and lowercase letters
                    </li>
                    <li
                      style={{
                        color: passwordWarning.number ? "#16a34a" : "#888",
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircleCheck
                        size={18}
                        color={passwordWarning.number ? "#16a34a" : "#888"}
                        style={{minWidth: 18}}
                      />
                      Numbers
                    </li>
                    <li
                      style={{
                        color: passwordWarning.special ? "#16a34a" : "#888",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircleCheck
                        size={18}
                        color={passwordWarning.special ? "#16a34a" : "#888"}
                        style={{minWidth: 18}}
                      />
                      Special characters (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
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
