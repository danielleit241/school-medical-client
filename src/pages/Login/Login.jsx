import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
// import axios from "axios";
import Swal from "sweetalert2";
import "./Login.scss";
import {Eye, EyeOff} from "lucide-react";
import {authenticationAPI} from "../../services/authentication";
import {useDispatch} from "react-redux";
import {setUserInfo} from "../../redux/feature/userSlice";
import axiosInstance from "../../api/axios";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [checked, setChecked] = useState(false);
  const [fieldError, setFieldError] = useState({phoneNumber: "", password: ""});
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  // const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate phoneNumber
    if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 11) {
      setFieldError({
        phoneNumber: "Phone number must be 10-11 characters.",
        password: "",
      });
      return;
    } else {
      setFieldError((prev) => ({...prev, phoneNumber: ""}));
    }

    try {
      // Bước 1: Check login để kiểm tra password mặc định
      const checkRes = await axiosInstance.post("/api/auth/check-login", {
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      const isDefaultPassword = checkRes.data === true;

      // Nếu password là mặc định thì chuyển sang reset password
      if (isDefaultPassword && formData.password === "123@123@123") {
        Swal.fire({
          icon: "info",
          title: "Default Password",
          text: "Please change your password.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/resetpassword", {
            state: {phoneNumber: formData.phoneNumber},
          });
        });
        return;
      }

      // Nếu password đã đổi, cho đăng nhập bình thường
      const response = await authenticationAPI.Login(formData);
      const data = response;
      // Lưu token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      //Decode payload token
      const payloadBase64 = data.accessToken.split(".")[1];
      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(atob(base64));

      //Lấy userId và role từ decodedPayload
      const roleClaim =
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const role =
        decodedPayload[roleClaim] || decodedPayload["role"] || "user";
      //Lấy userID từ decodedPayload
      const userIdClaim =
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
      const userId = decodedPayload[userIdClaim] || null;

      //Lưu vào Redux
      dispatch(setUserInfo({role, userId}));
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);

      // Hiện alert thành công
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        if (role === "admin" || role === "manager") {
          navigate("/admin");
        } else if (role === "nurse") {
          navigate("/nurse");
        } else if (role === "parent") {
          navigate("/");
        } else {
          navigate("/");
        }
      });
    } catch (err) {
      const msg = err.response?.data || "Login failed";
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: msg,
      });
      console.error(err);
    }
  };
  return (
    <>
      <div className="login_main animate__animated animate__fadeIn">
        <div className="login_form">
          <h2 className="login_name">Log in</h2>
          <form onSubmit={handleLogin}>
            <div className="login_form">
              <div>
                <label className="login_form__label">Phone Number: </label>
                <input
                  className="login_form__input"
                  type="text"
                  name="phoneNumber"
                  placeholder="0123456789"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                {fieldError.phoneNumber && (
                  <p
                    className="error-message"
                    style={{color: "red", marginTop: 5, fontSize: 12}}
                  >
                    {fieldError.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="login_form__label">Password: </label>
                <div className="login_form__eye-password">
                  <div
                    className="login_form__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{cursor: "pointer"}}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                  <div className="login_form__input-password">
                    <input
                      className="login_form__input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="***"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {fieldError.password && (
                  <p
                    className="error-message"
                    style={{color: "red", marginTop: 4, fontSize: 12}}
                  >
                    {fieldError.password}
                  </p>
                )}
              </div>
            </div>

            <div className="login_form__forget">
              <span
                style={{
                  cursor: "pointer",
                  color: "#aaa",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/changepassword")}
              >
                Forgot password
              </span>
            </div>

            <div className="login_form__terms">
              <div className="terms-container">
                <p className="m-0">By continuing, you agree to the </p>
                <span>
                  <a href="">Terms of use</a>
                </span>
                <p className="m-0"> and </p>
                <span>
                  <a href="">Privacy Policy</a>
                </span>
              </div>
            </div>
            <button type="submit" className="login_button">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
