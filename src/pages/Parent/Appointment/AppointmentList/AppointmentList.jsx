import React, {useEffect, useState, useRef} from "react";
import axiosInstance from "../../../../api/axios";
import {useSelector, useDispatch} from "react-redux";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {Card, Button, Form, Input, Select, Radio, Spin, Empty} from "antd";
import "./index.scss";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import dayjs from "dayjs";
import {AiOutlineCalendar, AiOutlineUser} from "react-icons/ai";
import {FiPhone, FiUser, FiMail} from "react-icons/fi";
import LogoDefault from "../../../../assets/images/defaultlogo.svg";
const {Option} = Select;

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [nurse, setNurse] = useState([]);
  const [freeNurseIds, setFreeNurseIds] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRequest, setDateRequest] = useState(() => {
    return dayjs().format("YYYY-MM-DD");
  });
  const [radio, setRadio] = useState("low");
  const [topic, setTopic] = useState("");
  const [appointmentStartTime, setAppointmentStartTime] = useState("");
  const [appointmentEndTime, setAppointmentEndTime] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [nurseProfile, setNurseProfile] = useState(null);
  const [hasBookedToday, setHasBookedToday] = useState(false);

  const userId = useSelector((state) => state.user?.userId);
  const parentId = localStorage.getItem("parentId") || userId;
  console.log("Parent ID:", parentId);
  const listStudentParent = useSelector(
    (state) => state.listStudentParent.listStudentParent
  );
  const studentId =
    listStudentParent.length > 0 ? listStudentParent[0].studentId : null;

  const [step2StartTime, setStep2StartTime] = useState("");
  const [step2EndTime, setStep2EndTime] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);

  // Update the Checking function to only check parent booking status
  const checkParentBookingStatus = async () => {
    if (!userId) return false;
    try {
      const res = await axiosInstance.get(
        `/api/parents/${parentId}/appointments/has-booked`
      );
      console.log("Check booked response:", res.data);

      // If returns 200 and data is "User has not booked any appointments."
      if (res.data === "User has not booked any appointments.") {
        setHasBookedToday(false);
        return false;
      }
      // Other cases (preventive)
      setHasBookedToday(false);
      return false;
    } catch (error) {
      console.error("Error checking user ID:", error);
      // If returns 400 and data is "User has booked appointments."
      if (
        error.response?.status === 400 &&
        error.response?.data === "User has booked appointments."
      ) {
        setHasBookedToday(true);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "You already booked appointment today.",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
        return true;
      }
      setHasBookedToday(false);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error checking appointment status.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return false; // Changed to false to not wrongly prevent booking
    }
  };

  // Tự động cập nhật ngày khi sang ngày mới
  useEffect(() => {
    const interval = setInterval(() => {
      const today = dayjs().format("YYYY-MM-DD");
      if (dateRequest !== today) {
        setDateRequest(today);
        setStep(1);
        setSelectedNurse(null);
        setStep2StartTime("");
        setStep2EndTime("");
        setAppointmentStartTime("");
        setAppointmentEndTime("");
      }
    }, 60 * 1000 * 86400); // kiểm tra mỗi phút
    return () => clearInterval(interval);
  }, [dateRequest]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if parent has already booked
        const hasBooked = await checkParentBookingStatus();
        console.log("Has booked today:", hasBooked);

        // Then fetch all nurses and available nurses separately
        const [nurseRes, freeRes] = await Promise.all([
          axiosInstance.get("/api/nurses"),
          axiosInstance.get("/api/users/free-nurses"),
        ]);

        setNurse(nurseRes.data);

        // Get list of free nurse IDs
        setFreeNurseIds(
          Array.isArray(freeRes.data)
            ? freeRes.data.map((n) => n.userId || n.staffNurseId)
            : []
        );
      } catch (error) {
        console.error("Error fetching nurse data:", error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${userId}/students`
        );
        if (response.data) {
          dispatch(setListStudentParent(response.data));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    if (!listStudentParent || listStudentParent.length === 0) {
      fetchStudents();
    }
  }, [dispatch, userId, listStudentParent]);

  // Fetch booked slots mỗi khi chọn nurse hoặc đổi ngày
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedNurse?.staffNurseId || !dateRequest) {
        setBookedSlots([]);
        return;
      }
      try {
        const res = await axiosInstance.get(
          `/api/nurses/${selectedNurse.staffNurseId}/appointments`,
          {
            params: {dateRequest, PageSize: 10, PageIndex: 1},
          }
        );
        const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
        const slots = data.map((item) => ({
          start: item.appointmentStartTime?.slice(0, 5),
          end: item.appointmentEndTime?.slice(0, 5),
          date: item.appointmentDate,
        }));
        setBookedSlots(slots);
      } catch {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedNurse, dateRequest]);

  // Khi chọn nurse, fetch profile
  const handleSelect = async (nurse) => {
    setSelectedNurse(nurse);
    setStep(2);
    try {
      const res = await axiosInstance.get(
        `/api/user-profile/${nurse.userId || nurse.staffNurseId}`
      );
      setNurseProfile(res.data);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setNurseProfile(null);
    }
  };

  const handleDateSubmit = () => {
    setAppointmentStartTime(step2StartTime);
    setAppointmentEndTime(step2EndTime);
    setStep(3);
  };

  const toTimeWithSeconds = (timeStr) => {
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  };

  const handleBookAppointment = async () => {
    const startTime = appointmentStartTime || step2StartTime;
    const endTime = appointmentEndTime || step2EndTime;

    if (
      !selectedStudentId ||
      !userId ||
      !selectedNurse?.staffNurseId ||
      !topic ||
      !dateRequest ||
      !startTime ||
      !endTime ||
      !appointmentReason
    ) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill in all required fields!",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    const payload = {
      studentId: selectedStudentId,
      userId,
      staffNurseId: selectedNurse.staffNurseId,
      topic,
      appointmentDate: dateRequest,
      appointmentStartTime: toTimeWithSeconds(startTime),
      appointmentEndTime: toTimeWithSeconds(endTime),
      appointmentReason,
    };

    try {
      const res = await axiosInstance.post(
        "/api/parents/appointments",
        payload
      );
      const appointmentId =
        res.data.notificationTypeId || res.data.appointmentId;

      // Lưu mapping nurse cho lịch sử
      let nurseMap = JSON.parse(localStorage.getItem("nurseMap") || "{}");
      nurseMap[appointmentId] = {
        staffNurseId: selectedNurse.staffNurseId,
        fullName: nurseProfile?.fullName || selectedNurse?.fullName,
      };
      localStorage.setItem("nurseMap", JSON.stringify(nurseMap));

      console.log("Appointment API response:", res);
      localStorage.setItem(
        "appointmentId",
        res.data.notificationTypeId || res.data.appointmentId
      );
      console.log(
        "Appointment ID:",
        res.data.notificationTypeId || res.data.appointmentId
      );
      const notificationRes = await axiosInstance.post(
        "/api/notification/appointments/to-nurse",
        {
          notificationTypeId:
            res.data.notificationTypeId || res.data.appointmentId,
          senderId: userId,
          receiverId: selectedNurse.staffNurseId,
        }
      );
      console.log("Notification API response:", notificationRes);
      setSuccess("Appointment booked successfully!");
      navigate("/parent/appointment-history", {replace: true});
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Appointment booked successfully!",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Appointment API error:", error);
      const errMsg =
        error.response?.data?.errors?.request?.[0] ||
        error.response?.data?.errors?.["$.appointmentStartTime"]?.[0] ||
        error.response?.data?.message ||
        "Failed to book appointment!";
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: errMsg,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    }
  };

  // Tạo 5 khung giờ bắt đầu từ 9h, mỗi khung 30 phút
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9;
    let minute = 0;
    for (let i = 0; i < 5; i++) {
      const start = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      minute += 30;
      if (minute === 60) {
        hour += 1;
        minute = 0;
      }
      const end = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push({start, end});
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Hàm kiểm tra slot đã bị đặt chưa
  const isSlotBooked = (slot) => {
    const slotStart =
      slot.start.length === 5 ? slot.start : slot.start.slice(0, 5);
    const slotEnd = slot.end.length === 5 ? slot.end : slot.end.slice(0, 5);
    return bookedSlots.some(
      (b) =>
        b.start === slotStart && b.end === slotEnd && b.date === dateRequest
    );
  };

  // Hiện hiệu ứng 3 dấu chấm lần lượt trong 2s rồi show list
  useEffect(() => {
    let interval = null;
    let timeout = null;
    timeout = setTimeout(() => {
      clearInterval(interval);
    }, 300); // tổng thời gian loading 0.3s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []); // chỉ chạy 1 lần khi mount

  // State cho popup info box
  const [showInfoBox, setShowInfoBox] = useState(false);
  const infoBoxRef = useRef(null);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        infoBoxRef.current &&
        !infoBoxRef.current.contains(event.target) &&
        event.target.id !== "info-question-btn"
      ) {
        setShowInfoBox(false);
      }
    };
    if (showInfoBox) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfoBox]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "90%",
          background: "#F8F8F8",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          margin: "20px auto",
        }}
      >
        {/* Step 1: Nurses List */}
        {step === 1 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 8px #f0f1f2",
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Header gradient - keep as is */}
            <div
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                padding: "36px 0 18px 0",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                textAlign: "center",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative background elements - keep as is */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "120px",
                  height: "120px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "25%",
                  width: "60px",
                  height: "60px",
                  background: "rgba(255, 193, 7, 0.2)",
                  borderRadius: "50%",
                }}
              />
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#fff",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Appointment Booking
              </h1>
              <div
                style={{
                  color: "#e0e7ff",
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                Parents can select a nurse to book a consultation for student
                health and nutrition.
              </div>
            </div>

            {/* Danh sách nurse - Clean card layout */}
            <div
              style={{
                padding: "40px 40px 40px 40px",
                background: "#fff",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                overflowY: "auto",
                maxHeight: "calc(100vh - 120px)",
              }}
            >
              {hasBookedToday && (
                <span
                  style={{
                    display: "block",
                    color: "#f5222d",
                    background: "#fff1f0",
                    border: "1px solid #ffd6d6",
                    borderRadius: 8,
                    padding: "10px 18px",
                    marginBottom: 18,
                    fontWeight: 600,
                    fontSize: 16,
                    textAlign: "center",
                    letterSpacing: 0.2,
                  }}
                >
                  *You already booked today
                </span>
              )}

              {/* Clean nurse cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  marginTop: 10,
                }}
              >
                {nurse.map((n) => {
                  const isNurseAvailable = freeNurseIds.includes(
                    n.userId || n.staffNurseId
                  );
                  const nurseInfo = {
                    specialty: "School Nurse",
                    workingDays: "Monday - Friday (9:30 - 11:30)",
                    skills: [
                      "First Aid",
                      "Nutrition Counseling",
                      "Vaccination",
                    ],
                  };

                  return (
                    <div
                      key={n.staffNurseId || n.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 2px 8px rgba(43,93,196,0.07)",
                        padding: "28px 32px",
                        border: "1px solid #e6eaf3",
                        minHeight: 120,
                      }}
                    >
                      {/* Left: Info */}
                      <div
                        style={{display: "flex", alignItems: "center", flex: 1}}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: "20%",
                            background: "#0284c7",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 28,
                          }}
                        >
                          {n.avatarUrl ? (
                            <img
                              src={n.avatarUrl}
                              alt={n.fullName}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "20%",
                              }}
                            />
                          ) : (
                            <img
                              src={LogoDefault}
                              alt="Default Logo"
                              style={{
                                width: "95%",
                                height: "95%",
                                borderRadius: "20%",
                                // objectFit: "contain",
                                // filter: "brightness(0) invert(1)",
                              }}
                            />
                          )}
                        </div>
                        {/* Info */}
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 20,
                              marginBottom: 4,
                            }}
                          >
                            {n.fullName}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              color: "#4b5563",
                              fontSize: 15,
                              marginBottom: 4,
                            }}
                          >
                            <FiPhone
                              style={{marginRight: 8, color: "#1890ff"}}
                            />
                            {n.phoneNumber}
                            <span style={{margin: "0 12px"}}></span>
                            <AiOutlineCalendar
                              style={{marginRight: 8, color: "#1890ff"}}
                            />
                            {nurseInfo.workingDays}
                          </div>
                          <div style={{display: "flex", gap: 8, marginTop: 6}}>
                            {nurseInfo.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#f0f7ff",
                                  color: "#2563eb",
                                  padding: "4px 12px",
                                  borderRadius: 8,
                                  fontSize: 14,
                                  fontWeight: 500,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Right: Status & Button */}
                      <div
                        style={{display: "flex", alignItems: "center", gap: 18}}
                      >
                        <span
                          style={{
                            background: isNurseAvailable
                              ? "#e6fff2"
                              : "#fff1f0",
                            color: isNurseAvailable ? "#1bbf7a" : "#f5222d",
                            borderRadius: 8,
                            padding: "6px 18px",
                            fontWeight: 600,
                            fontSize: 16,
                            border: `1px solid ${
                              isNurseAvailable ? "#b7eb8f" : "#ffccc7"
                            }`,
                            marginRight: 6,
                          }}
                        >
                          {isNurseAvailable ? "Available" : "Unavailable"}
                        </span>
                        <Button
                          disabled={!isNurseAvailable || hasBookedToday}
                          style={{
                            borderRadius: 8,
                            background:
                              isNurseAvailable && !hasBookedToday
                                ? "#355383"
                                : "#ccc",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 16,
                            padding: "8px 28px",
                            opacity:
                              isNurseAvailable && !hasBookedToday ? 1 : 0.7,
                            pointerEvents:
                              isNurseAvailable && !hasBookedToday
                                ? "auto"
                                : "none",
                          }}
                          onClick={() => handleSelect(n)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Time Slot - 3-column layout */}
        {step === 2 && selectedNurse && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 8px #f0f1f2",
              padding: 0,
              overflow: "hidden",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* Header gradient */}
            <div
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                padding: "36px 0 18px 0",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                textAlign: "center",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative background elements */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "120px",
                  height: "120px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "25%",
                  width: "60px",
                  height: "60px",
                  background: "rgba(255, 193, 7, 0.2)",
                  borderRadius: "50%",
                }}
              />
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#fff",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Appointment Booking
              </h1>
              <div
                style={{
                  color: "#e0e7ff",
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                Book your appointment with our healthcare professionals
              </div>
            </div>

            {/* Main content area with 3-column layout */}
            <div
              style={{
                padding: "40px",
                background: "#fff",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                display: "flex",
                gap: 30,
                alignItems: "flex-start",
              }}
            >
              {/* COLUMN 1: Avatar */}
              <div
                style={{
                  width: "25%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 12,
                }}
              >
                <img
                  src={nurseProfile?.avatarUrl || LogoDefault}
                  alt="Nurse avatar"
                  style={{
                    width: "100%",
                    height: "350px",
                    aspectRatio: "1/1",
                    borderRadius: "16px",
                    objectFit: "cover",
                    border: "1px solid #eee",
                    boxShadow: "0 2px 2px rgba(0,0,0,0.08)",
                    marginBottom: 16,
                  }}
                />
              </div>

              {/* COLUMN 2: Nurse Information */}
              <div
                style={{
                  width: "30%",
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #eee",
                  boxShadow: "0 2px 2px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f9fafc",
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#355383",
                    }}
                  >
                    Nurse Information
                  </div>
                </div>

                <div style={{padding: "16px 20px"}}>
                  <div style={{marginBottom: 16}}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiUser size={18} />
                      </div>
                      <div>
                        <div
                          style={{fontSize: 14, color: "#888", marginBottom: 2}}
                        >
                          Name
                        </div>
                        <div style={{fontWeight: 500, fontSize: 16}}>
                          {nurseProfile?.fullName || selectedNurse?.fullName}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiPhone size={18} />
                      </div>
                      <div>
                        <div
                          style={{fontSize: 14, color: "#888", marginBottom: 2}}
                        >
                          Phone
                        </div>
                        <div style={{fontWeight: 500, fontSize: 16}}>
                          {nurseProfile?.phoneNumber ||
                            selectedNurse?.phoneNumber}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AiOutlineCalendar size={18} />
                      </div>
                      <div>
                        <div
                          style={{fontSize: 14, color: "#888", marginBottom: 2}}
                        >
                          Date of Birth
                        </div>
                        <div style={{fontWeight: 500, fontSize: 16}}>
                          {nurseProfile?.dateOfBirth || "Not provided"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 2,
                        }}
                      >
                        <FiMail size={18} />
                      </div>
                      <div>
                        <div
                          style={{fontSize: 14, color: "#888", marginBottom: 2}}
                        >
                          Email
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 16,
                            wordBreak: "break-word",
                          }}
                        >
                          {nurseProfile?.emailAddress || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: Time Slot Selection */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    marginBottom: 20,
                    border: "1px solid #e0e7ef",
                  }}
                >
                  <div style={{display: "flex", alignItems: "center"}}>
                    <div
                      style={{
                        color: "#5b8cff",
                        background: "#eaf1ff",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                        fontSize: 18,
                      }}
                    >
                      📅
                    </div>
                    <div>
                      <div
                        style={{fontSize: 14, color: "#666", marginBottom: 2}}
                      >
                        Date
                      </div>
                      <div style={{fontWeight: 700, fontSize: 18}}>
                        {dateRequest}
                      </div>
                    </div>
                  </div>
                </div>

                <Form layout="vertical" onFinish={handleDateSubmit}>
                  <Form.Item
                    label={
                      <span
                        style={{fontSize: 16, fontWeight: 600, color: "#333"}}
                      >
                        Select Time Slot
                      </span>
                    }
                    required
                    style={{marginBottom: 30}}
                  >
                    {timeSlots.filter((slot) => !isSlotBooked(slot)).length ===
                      0 && (
                      <div
                        style={{
                          color: "#f5222d",
                          fontWeight: 600,
                          marginBottom: 16,
                          padding: "10px 16px",
                          background: "#fff1f0",
                          borderRadius: 8,
                          border: "1px solid #ffccc7",
                        }}
                      >
                        This nurse's booking is over for today.
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        marginTop: 10,
                      }}
                    >
                      {timeSlots
                        .filter((slot) => !isSlotBooked(slot))
                        .map((slot, idx) => (
                          <Button
                            key={idx}
                            type={
                              step2StartTime === slot.start
                                ? "primary"
                                : "default"
                            }
                            style={{
                              minWidth: 130,
                              height: 48,
                              textAlign: "center",
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 16,
                              background:
                                step2StartTime === slot.start
                                  ? "#355383"
                                  : "#fff",
                              color:
                                step2StartTime === slot.start
                                  ? "#fff"
                                  : "#355383",
                              border: "1px solid #355383",
                              boxShadow:
                                step2StartTime === slot.start
                                  ? "0 2px 8px #35538333"
                                  : "",
                              transition: "all 0.2s",
                            }}
                            onClick={() => {
                              setStep2StartTime(slot.start);
                              setStep2EndTime(slot.end);
                            }}
                          >
                            {slot.start} - {slot.end}
                          </Button>
                        ))}
                    </div>
                  </Form.Item>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 15,
                      marginTop: 30,
                    }}
                  >
                    <Button
                      onClick={() => {
                        setStep(1);
                        setSelectedNurse(null);
                        setStep2StartTime("");
                        setStep2EndTime("");
                      }}
                      style={{
                        height: 46,
                        borderRadius: 8,
                        background: "#fff",
                        color: "#355383",
                        border: "1px solid #355383",
                        fontWeight: 600,
                        fontSize: 16,
                        paddingLeft: 20,
                        paddingRight: 20,
                      }}
                    >
                      ← Previous
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={
                        !step2StartTime ||
                        timeSlots.filter((slot) => !isSlotBooked(slot))
                          .length === 0
                      }
                      style={{
                        height: 46,
                        borderRadius: 8,
                        background: "#355383",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 16,
                        paddingLeft: 24,
                        paddingRight: 24,
                        minWidth: 100,
                      }}
                    >
                      Next →
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Book Appointment */}
        {step === 3 && selectedNurse && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 8px #f0f1f2",
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Header gradient */}
            <div
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                padding: "36px 0 18px 0",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                textAlign: "center",
                marginBottom: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative background elements */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "120px",
                  height: "120px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "25%",
                  width: "60px",
                  height: "60px",
                  background: "rgba(255, 193, 7, 0.2)",
                  borderRadius: "50%",
                }}
              />
              <h1
                style={{
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#fff",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Appointment Booking
              </h1>
              <div
                style={{
                  color: "#e0e7ff",
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                Book your appointment with our healthcare professionals
              </div>
            </div>

            {/* Main content */}
            <div
              style={{
                padding: "40px",
                background: "#fff",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            >
              <div
                className="animate__animated animate__fadeIn animate-delay-0.5s"
                style={{
                  display: "flex",
                  gap: 32,
                  alignItems: "flex-start",
                }}
              >
                {/* LEFT: FORM */}
                <div
                  style={{
                    flex: 2,
                    background: "#fff",
                    borderRadius: 12,
                    padding: 32,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Form
                    layout="vertical"
                    onFinish={handleBookAppointment}
                    initialValues={{
                      selectedStudentId,
                      topic,
                      appointmentReason,
                    }}
                  >
                    <Form.Item
                      label={
                        <span style={{fontSize: 16, fontWeight: 600}}>
                          Your Chilren
                        </span>
                      }
                      required
                    >
                      <Select
                        value={selectedStudentId || undefined}
                        onChange={(value) => setSelectedStudentId(value)}
                        placeholder="Select Student"
                        size="large"
                        style={{borderRadius: 8}}
                      >
                        {listStudentParent.map((student) => (
                          <Option
                            key={student.studentId}
                            value={student.studentId}
                          >
                            {student.fullName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{fontSize: 16, fontWeight: 600}}>
                          Consultation Topic
                        </span>
                      }
                      required
                    >
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        size="large"
                        placeholder="e.g., Annual check-up, Vaccination, Health concern"
                        style={{borderRadius: 8}}
                      />
                    </Form.Item>

                    {/* Urgency Level */}
                    <Form.Item
                      label={
                        <span style={{fontSize: 16, fontWeight: 600}}>
                          Urgency Level
                        </span>
                      }
                    >
                      <Radio.Group defaultValue="normal" buttonStyle="solid">
                        <Radio.Button
                          value="low"
                          style={{
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            borderColor: "#52c41a",
                            backgroundColor:
                              step === 3 && radio === "low"
                                ? "#52c41a"
                                : "#f6ffed",
                            color:
                              step === 3 && radio === "low"
                                ? "#fff"
                                : "#52c41a",
                            fontWeight: 600,
                            boxShadow:
                              step === 3 && radio === "low"
                                ? "0 2px 6px rgba(82, 196, 26, 0.4)"
                                : "none",
                          }}
                          onClick={() => setRadio("low")}
                        >
                          Low
                        </Radio.Button>
                        <Radio.Button
                          value="normal"
                          style={{
                            borderColor: "#1890ff",
                            backgroundColor:
                              step === 3 && radio === "normal"
                                ? "#1890ff"
                                : "#e6f7ff",
                            color:
                              step === 3 && radio === "normal"
                                ? "#fff"
                                : "#1890ff",
                            fontWeight: 600,
                            boxShadow:
                              step === 3 && radio === "normal"
                                ? "0 2px 6px rgba(24, 144, 255, 0.4)"
                                : "none",
                          }}
                          onClick={() => setRadio("normal")}
                        >
                          Normal
                        </Radio.Button>
                        <Radio.Button
                          value="high"
                          style={{
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                            borderColor: "#f5222d",
                            backgroundColor:
                              step === 3 && radio === "high"
                                ? "#f5222d"
                                : "#fff1f0",
                            color:
                              step === 3 && radio === "high"
                                ? "#fff"
                                : "#f5222d",
                            fontWeight: 600,
                            boxShadow:
                              step === 3 && radio === "high"
                                ? "0 2px 6px rgba(245, 34, 45, 0.4)"
                                : "none",
                          }}
                          onClick={() => setRadio("high")}
                        >
                          High
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span style={{fontSize: 16, fontWeight: 600}}>
                          Reason for Visit
                        </span>
                      }
                      required
                    >
                      <Input.TextArea
                        value={appointmentReason}
                        onChange={(e) => setAppointmentReason(e.target.value)}
                        size="large"
                        placeholder="Please describe symptoms, concerns, or the purpose of this appointment..."
                        rows={4}
                        style={{borderRadius: 8, fontSize: 15}}
                      />
                    </Form.Item>

                    <div
                      style={{
                        display: "flex",
                        gap: 24,
                        marginTop: 24,
                        marginBottom: 24,
                      }}
                    >
                      <div style={{flex: 1}}>
                        <Form.Item
                          label={
                            <span style={{fontSize: 16, fontWeight: 600}}>
                              Date
                            </span>
                          }
                        >
                          <Input
                            value={dateRequest}
                            readOnly
                            size="large"
                            style={{
                              borderRadius: 8,
                              background: "#f9f9f9",
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div style={{flex: 1}}>
                        <Form.Item
                          label={
                            <span style={{fontSize: 16, fontWeight: 600}}>
                              Time
                            </span>
                          }
                        >
                          <Input
                            value={`${
                              appointmentStartTime || step2StartTime
                            } - ${appointmentEndTime || step2EndTime}`}
                            readOnly
                            size="large"
                            style={{
                              borderRadius: 8,
                              background: "#f9f9f9",
                            }}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 30,
                        padding: "20px 0 0 0",
                        borderTop: "1px solid #f0f0f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 12,
                        }}
                      >
                        <Button
                          onClick={() => setStep(2)}
                          style={{
                            height: 46,
                            borderRadius: 8,
                            background: "#fff",
                            color: "#355383",
                            border: "1px solid #355383",
                            fontWeight: 600,
                            fontSize: 16,
                            paddingLeft: 20,
                            paddingRight: 20,
                          }}
                        >
                          ← Previous
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{
                            height: 46,
                            borderRadius: 8,
                            background: "#355383",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 16,
                            paddingLeft: 24,
                            paddingRight: 24,
                            minWidth: 120,
                          }}
                        >
                          Submit Booking
                        </Button>
                      </div>
                    </div>

                    {success && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "12px 16px",
                          background: "#f6ffed",
                          border: "1px solid #b7eb8f",
                          borderRadius: 8,
                          color: "#52c41a",
                          fontWeight: 600,
                        }}
                      >
                        {success}
                      </div>
                    )}
                  </Form>
                </div>

                {/* RIGHT COLUMN: Booking Summary and Support */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  {/* Booking Summary */}
                  <div
                    style={{
                      background: "#E6F4FF",
                      borderRadius: 16,
                      padding: 28,
                      boxShadow: "0 2px 8px #e0e7ef",
                      minWidth: 340,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <span
                        style={{
                          background: "#355383",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          marginRight: 12,
                        }}
                      >
                        <AiOutlineUser style={{fontSize: 20}} />
                      </span>
                      <span
                        style={{fontWeight: 700, fontSize: 20, color: "#222"}}
                      >
                        Booking Summary
                      </span>
                    </div>

                    {/* Nurse */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "14px 18px",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 1px 2px #f0f1f2",
                      }}
                    >
                      <span
                        style={{
                          background: "#e6fff2",
                          color: "#1bbf7a",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🧑‍⚕️
                      </span>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, color: "#222"}}>
                          Nurse
                        </div>
                        <div style={{fontWeight: 700}}>
                          {nurseProfile?.fullName ||
                            selectedNurse?.fullName ||
                            "—"}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "14px 18px",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 1px 2px #f0f1f2",
                      }}
                    >
                      <span
                        style={{
                          background: "#eaf1ff",
                          color: "#5b8cff",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        📅
                      </span>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, color: "#222"}}>
                          Date & Time
                        </div>
                        <div style={{fontWeight: 700}}>
                          {dateRequest},{" "}
                          {appointmentStartTime || step2StartTime} -{" "}
                          {appointmentEndTime || step2EndTime}
                        </div>
                      </div>
                    </div>

                    {/* Patient */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "14px 18px",
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 1px 2px #f0f1f2",
                      }}
                    >
                      <span
                        style={{
                          background: "#fff0f6",
                          color: "#eb2f96",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        👨‍🎓
                      </span>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, color: "#222"}}>
                          Patient
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: selectedStudentId ? "#333" : "#888",
                            fontStyle: !selectedStudentId ? "italic" : "normal",
                          }}
                        >
                          {listStudentParent.find(
                            (s) => s.studentId === selectedStudentId
                          )?.fullName || (
                            <span style={{color: "#bbb"}}>To be assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Appointment ID will be generated after submission */}
                    <div
                      style={{
                        borderTop: "1px solid #dde3ec",
                        margin: "16px 0 0 0",
                        paddingTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#555",
                        fontSize: 15,
                      }}
                    ></div>
                  </div>

                  {/* Help Card */}
                  <div
                    style={{
                      background: "#f7f1ff",
                      borderRadius: 16,
                      padding: 24,
                      textAlign: "center",
                      color: "#a259e6",
                      border: "1px solid #e0d7fa",
                    }}
                  >
                    <div style={{fontSize: 32, marginBottom: 8}}>♡</div>
                    <div
                      style={{fontWeight: 700, marginBottom: 8, fontSize: 18}}
                    >
                      Need Help?
                    </div>
                    <div style={{marginBottom: 14, color: "#888"}}>
                      Our support team is here to assist you with your booking.
                    </div>
                    <Button
                      style={{
                        borderRadius: 8,
                        background: "#fff",
                        color: "#a259e6",
                        border: "1px solid #a259e6",
                        fontWeight: 600,
                        height: 42,
                      }}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nút dấu hỏi ở góc phải dưới */}
      <button
        id="info-question-btn"
        onClick={() => setShowInfoBox(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#ccc",
          color: "#fff",
          fontSize: 32,
          border: "none",
          boxShadow: "0 2px 8px #ccc",
          cursor: "pointer",
          zIndex: 1001,
        }}
        aria-label="Thông tin tư vấn y tế"
      >
        ?
      </button>

      {/* Popup Info Box */}
      {showInfoBox && (
        <div
          ref={infoBoxRef}
          style={{
            position: "fixed",
            bottom: 100,
            right: 40,
            background: "#fafbfc",
            borderRadius: 16,
            border: "1px solid #ccc",
            padding: 28,
            minWidth: 340,
            maxWidth: 380,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            zIndex: 1002,
            animation: "fadeIn 0.3s",
          }}
        >
          <div style={{fontWeight: 700, fontSize: 20, marginBottom: 12}}>
            Thông tin tư vấn y tế
          </div>
          <div style={{color: "#555", marginBottom: 8}}>
            <b>Giờ làm việc phòng y tế:</b>
            <br />
            Thứ 2 - Thứ 6: 8:30 - 17:00
            <br />
            Thứ 7: 8:30 - 12:00
          </div>
          <div style={{color: "#555", marginBottom: 8}}>
            <b>Liên hệ khẩn cấp:</b>
            <br />
            Phòng y tế: 028.1234.5678
            <br />
            Văn phòng trường: 028.1234.5679
          </div>
          <div style={{color: "#555", marginBottom: 8}}>
            <b>Lưu ý:</b>
            <ul
              style={{
                margin: "6px 0 0 18px",
                padding: 0,
                color: "#888",
                fontSize: 14,
              }}
            >
              <li>Đặt lịch hẹn trước ít nhất 1 ngày.</li>
              <li>Vui lòng đến đúng giờ hẹn.</li>
              <li>
                Nếu cần thay đổi lịch hẹn, hãy thông báo trước 24 giờ để được hỗ
                trợ.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
