import React, {useState, useEffect, useRef} from "react";
import "./index.scss";
import axiosInstance from "../../api/axios";
import {Alert, Button} from "antd";
import {useNavigate} from "react-router-dom";

const ChangePassword = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [stepAnimation, setStepAnimation] = useState("fade-in");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [countdown, setCountdown] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

  const OTP_LENGTH = 6;
  const [otpArray, setOtpArray] = useState(Array(OTP_LENGTH).fill(""));
  const otpInputs = useRef([]);

  // Step 1: send otp to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSendingOtp(true);
    try {
      await axiosInstance.post("/api/auth/forgot-password/send-otp", {
        phoneNumber,
        emailAddress,
      });
      setStepAnimation("fade-out");
      setTimeout(() => {
        setSuccess("OTP sent successfully. Please check your email.");
        setStep(2);
        setStepAnimation("fade-in");
        setSendingOtp(false);
      }, 300);
    } catch (err) {
      setError(
        err.response?.data?.message || "Check again your email or phone number."
      );
      setSendingOtp(false);
    }
  };

  // Step 2: verify otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otp = otpArray.join("");
    try {
      await axiosInstance.post(
        "/api/auth/forgot-password/verify-otp",
        `"${otp}"`
      );
      setOtp(otp);
      setSuccess("OTP verified successfully. Please enter your new password.");
      setStepAnimation("fade-out");
      setTimeout(() => {
        setStep(3);
        setStepAnimation("fade-in");
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Step 3: change password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    try {
      await axiosInstance.post("/api/auth/forgot-password/reset-password", {
        otp,
        phoneNumber,
        newPassword,
        confirmNewPassword,
      });
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/login");
      }, 2000);
      setStep(1);
      setPhoneNumber("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    }
  };

  // Khi nhập newPassword, kiểm tra realtime
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

  // Title cho từng step
  const getStepTitle = () => {
    if (step === 1) return "Forgot Password";
    if (step === 2) return "Verify OTP";
    if (step === 3) return "Reset Password";
    return "";
  };

  // Khi chuyển sang step 2, bắt đầu đếm ngược
  useEffect(() => {
    let timer;
    if (step === 2) {
      setCountdown(60);
      setShowResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          if (prev === 41) setShowResend(true);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const arr = [...otpArray];
    if (val) {
      arr[idx] = val[0];
      setOtpArray(arr);
      if (idx < OTP_LENGTH - 1) {
        otpInputs.current[idx + 1].focus();
      }
    } else {
      // Nếu xóa thì clear ô hiện tại
      arr[idx] = "";
      setOtpArray(arr);
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otpArray[idx]) {
        // Nếu ô hiện tại có số thì xóa số đó
        const arr = [...otpArray];
        arr[idx] = "";
        setOtpArray(arr);
      } else if (idx > 0) {
        // Nếu ô hiện tại rỗng thì focus về ô trước
        otpInputs.current[idx - 1].focus();
      }
    }
  };

  const handlePasteOtp = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste) {
      const arr = paste.split("").slice(0, OTP_LENGTH);
      setOtpArray((prev) => prev.map((_, i) => arr[i] || ""));
      setTimeout(() => {
        const next = arr.length < OTP_LENGTH ? arr.length : OTP_LENGTH - 1;
        otpInputs.current[next].focus();
      }, 0);
      e.preventDefault();
    }
  };

  return (
    <div className="reset_main">
      <div className="reset_form">
        <h2 className={`reset_name ${stepAnimation}`}>{getStepTitle()}</h2>
        <div className="reset_message">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className={error ? "custom-alert-animate" : "custom-alert-hide"}
              style={{marginBottom: 12}}
            />
          )}
          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
              className={success ? "custom-alert-animate" : "custom-alert-hide"}
              style={{marginBottom: 12}}
            />
          )}
          {showSuccessAlert && (
            <Alert
              message="Reset password successfully"
              type="success"
              showIcon
              className={
                showSuccessAlert ? "custom-alert-animate" : "custom-alert-hide"
              }
              style={{
                marginBottom: 12,
                position: "fixed",
                top: 140,
                right: 0,
                width: 300,
                zIndex: 9999,
              }}
              closable={false}
            />
          )}
        </div>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className={stepAnimation}>
            <div className="reset_form__input">
              <label>Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="reset_form__input">
              <label>Email</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <button type="submit" disabled={sendingOtp}>
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className={stepAnimation}>
            <div className="reset_form__input" style={{marginBottom: 24}}>
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  justifyContent: "center",
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                {otpArray.map((num, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={num}
                    onChange={(e) => handleOtpChange(e, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handlePasteOtp}
                    style={{
                      width: 44,
                      height: 48,
                      textAlign: "center",
                      fontSize: 24,
                      border: "none",
                      borderBottom:
                        "3px solid " + (num ? "#1890ff" : "#d9d9d9"),
                      outline: "none",
                      background: "transparent",
                      color: "#222",
                      transition: "border-color 0.2s",
                      letterSpacing: "2px",
                      boxShadow: "0 0 5 0 rgba(0, 0, 0, 0.2)",
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              {/* Countdown + Send OTP nhỏ nằm dưới input */}
              <div
                style={{
                  fontSize: 15,
                  color: "#bfbfbf",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 20,
                  userSelect: "none",
                  justifyContent: "center",
                }}
              >
                <span>
                  {countdown > 0 ? "Dont receive OTP? " : "Resend OTP in "}
                </span>
                {showResend && (
                  <Button
                    type="link"
                    style={{
                      color: "#40a9ff",
                      background: "none",
                      border: "none",
                      boxShadow: "none",
                      fontWeight: 400,
                      fontSize: 15,
                      padding: 0,
                      textDecoration: "underline",
                      minWidth: 0,
                      height: "auto",
                      lineHeight: 1,
                      bottom: 5,
                    }}
                    onClick={handleSendOtp}
                  >
                    Resend
                  </Button>
                )}
              </div>
            </div>
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className={stepAnimation}>
            <div className="reset_form__input">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="Enter new password"
                required
              />
              <div style={{fontSize: 13, marginTop: 4}}>
                <p
                  style={{
                    color: passwordWarning.length ? "green" : "red",
                    margin: 0,
                  }}
                >
                  • At least 6 characters
                </p>
                <p
                  style={{
                    color: passwordWarning.uppercase ? "green" : "red",
                    margin: 0,
                  }}
                >
                  • At least one uppercase letter
                </p>
                <p
                  style={{
                    color: passwordWarning.number ? "green" : "red",
                    margin: 0,
                  }}
                >
                  • At least one number
                </p>
                <p
                  style={{
                    color: passwordWarning.special ? "green" : "red",
                    margin: 0,
                  }}
                >
                  • At least one special character
                </p>
              </div>
            </div>
            <div className="reset_form__input">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
