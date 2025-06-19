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
import {FiPhone} from "react-icons/fi";
import LogoDefault from "../../../../assets/images/defaultlogo.svg";
const {Option} = Select;

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [nurse, setNurse] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRequest, setDateRequest] = useState(() => {
    return dayjs().format("YYYY-MM-DD");
  });
  const [topic, setTopic] = useState("");
  const [appointmentStartTime, setAppointmentStartTime] = useState("");
  const [appointmentEndTime, setAppointmentEndTime] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [nurseProfile, setNurseProfile] = useState(null);

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
    const fetchNurse = async () => {
      try {
        const response = await axiosInstance.get("/api/nurses");
        setNurse(response.data);
      } catch (error) {
        console.error("Error fetching nurse data:", error);
      }
    };
    fetchNurse();
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
                Parents can select a nurse to book a consultation for student
                health and nutrition.
              </div>
            </div>
            {/* Danh sách nurse */}
            <div
              style={{
                height: "calc(100vh - 100px)",
                padding: "40px 40px 40px 40px",
                background: "#fff",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                style={{marginTop: 10}}
              >
                {nurse.map((n) => {
                  // Shared sample info for all nurses
                  //NHẮC
                  const nurseInfo = {
                    specialty: "School Nurse",
                    workingDays: "Monday - Friday (9:30 - 11:30)",
                    skills: [
                      "First Aid",
                      "Nutrition Counseling",
                      "Vaccination",
                    ],
                    available: true,
                  };
                  return (
                    <div
                      key={n.staffNurseId || n.id}
                      className="animate__animated animate__fadeIn"
                      style={{
                        background: "#fff",
                        borderRadius: 14,
                        boxShadow: "0 2px 8px #e0e7ef",
                        padding: 24,
                        border: "1px solid #e0e7ef",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        opacity: nurseInfo.available ? 1 : 0.6,
                        position: "relative",
                        minHeight: 220,
                      }}
                    >
                      <div
                        style={{fontWeight: 700, fontSize: 20, marginBottom: 2}}
                      >
                        {n.fullName}
                      </div>
                      <div
                        style={{color: "#555", fontSize: 16, marginBottom: 2}}
                      >
                        {nurseInfo.specialty}
                      </div>
                      <div
                        style={{color: "#666", fontSize: 15, marginBottom: 2}}
                      >
                        <span role="img" aria-label="calendar">
                          <AiOutlineCalendar
                            style={{display: "inline-block", marginRight: 4}}
                          />
                        </span>{" "}
                        {nurseInfo.workingDays}
                      </div>
                      <div
                        style={{color: "#666", fontSize: 15, marginBottom: 2}}
                      >
                        <span role="img" aria-label="phone">
                          <FiPhone
                            style={{display: "inline-block", marginRight: 4}}
                          />
                        </span>{" "}
                        {n.phoneNumber}
                      </div>
                      <div
                        style={{
                          color: "#555",
                          fontSize: 15,
                          margin: "6px 0 2px 0",
                        }}
                      >
                        <b>Expertise:</b>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        {nurseInfo.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "#f0f1f7",
                              color: "#355383",
                              borderRadius: 8,
                              padding: "2px 10px",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      {/* Status */}
                      <span
                        style={{
                          position: "absolute",
                          top: 18,
                          right: 18,
                          background: nurseInfo.available ? "#e6fff2" : "#ccc",
                          color: nurseInfo.available ? "#1bbf7a" : "#888",
                          borderRadius: 8,
                          padding: "2px 12px",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {nurseInfo.available ? "Available" : "Not available"}
                      </span>
                      <Button
                        disabled={!nurseInfo.available}
                        style={{
                          marginTop: 12,
                          borderRadius: 8,
                          background: nurseInfo.available ? "#355383" : "#ccc",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 16,
                          padding: "8px 10px",
                          width: "100%",
                          opacity: nurseInfo.available ? 1 : 0.7,
                          pointerEvents: nurseInfo.available ? "auto" : "none",
                        }}
                        onClick={() => handleSelect(n)}
                      >
                        Book Now
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Time Slot */}
        {step === 2 && selectedNurse && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 8px #f0f1f2",
              padding: 0,
              overflow: "hidden",
              minWidth: 1100,
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
            {/* Nội dung chọn thời gian */}
            <div
              style={{
                display: "flex",
                gap: 40,
                padding: 40,
                alignItems: "flex-start",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                background: "#fff",
              }}
            >
              {/* LEFT: Nurse Profile */}
              {nurseProfile && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "40%",
                    minWidth: 320,
                    minHeight: 340,
                    justifyContent: "center",
                    boxShadow: "0 1px 5px #e0e7ef",
                  }}
                >
                  <img
                    src={
                      nurseProfile.avatarUrl
                        ? nurseProfile.avatarUrl
                        : LogoDefault
                    }
                    alt="avatar"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: "20px",
                      objectFit: "cover",
                      border: "1px solid #eee",
                      marginBottom: 18,
                    }}
                  />
                  <div style={{width: "100%"}}>
                    <div style={{display: "flex", marginBottom: 8}}>
                      <span style={{color: "#888", minWidth: 80}}>Nurse:</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#355383",
                          marginLeft: 8,
                        }}
                      >
                        {nurseProfile.fullName}
                      </span>
                    </div>
                    <div style={{display: "flex", marginBottom: 8}}>
                      <span style={{color: "#888", minWidth: 80}}>Phone:</span>
                      <span
                        style={{fontWeight: 500, color: "#222", marginLeft: 8}}
                      >
                        {nurseProfile.phoneNumber}
                      </span>
                    </div>
                    <div style={{display: "flex", marginBottom: 8}}>
                      <span style={{color: "#888", minWidth: 80}}>
                        Date of Birth:
                      </span>
                      <span
                        style={{fontWeight: 500, color: "#222", marginLeft: 8}}
                      >
                        {nurseProfile.dateOfBirth}
                      </span>
                    </div>
                    <div style={{display: "flex", marginBottom: 8}}>
                      <span style={{color: "#888", minWidth: 80}}>Email:</span>
                      <span
                        style={{fontWeight: 500, color: "#222", marginLeft: 8}}
                      >
                        {nurseProfile.emailAddress}
                      </span>
                    </div>
                    <div style={{display: "flex", marginBottom: 8}}>
                      <span style={{color: "#888", minWidth: 80}}>
                        Đánh giá:
                      </span>
                      {Array.from({length: 5}).map((_, idx) => (
                        <span
                          key={idx}
                          style={{
                            color: "#FFD700",
                            fontSize: 22,
                            marginRight: 2,
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT: Select Time */}
              <div style={{flex: 1}}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 18,
                    textAlign: "center",
                  }}
                >
                  Choose a time slot
                </div>
                <div style={{marginBottom: 16, fontSize: 16}}>
                  <b>Date:</b> {dateRequest}
                </div>
                <Form layout="vertical" onFinish={handleDateSubmit}>
                  <Form.Item label="Select Time Slot" required>
                    {timeSlots.filter((slot) => !isSlotBooked(slot)).length ===
                      0 && (
                      <div
                        style={{
                          color: "red",
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        This nurse's booking is over for today.
                      </div>
                    )}
                    <div style={{display: "flex", gap: 20, flexWrap: "wrap"}}>
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
                              minWidth: 120,
                              textAlign: "center",
                              borderRadius: 8,
                              marginBottom: 8,
                              fontWeight: 600,
                              fontSize: 15,
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
                      gap: 12,
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
                        borderRadius: 8,
                        background: "#fff",
                        color: "#355383",
                        border: "1px solid #355383",
                        fontWeight: 600,
                      }}
                    >
                      ← Previous
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        borderRadius: 8,
                        background: "#355383",
                        color: "#fff",
                        fontWeight: 600,
                        minWidth: 90,
                      }}
                      disabled={
                        !step2StartTime ||
                        timeSlots.filter((slot) => !isSlotBooked(slot))
                          .length === 0
                      }
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
            className="animate__animated animate__fadeIn animate-delay-0.5s"
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 8px #f0f1f2",
              padding: 32,
              minWidth: 1200,
            }}
          >
            <div style={{display: "flex", gap: 32, alignItems: "flex-start"}}>
              {/* LEFT: FORM */}
              <div
                style={{
                  flex: 2,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 32,
                }}
              >
                <div style={{fontSize: 24, fontWeight: 700, marginBottom: 4}}>
                  <h2 style={{fontWeight: 700}}>Appointment Details</h2>
                </div>
                <div style={{color: "#888", marginBottom: 24}}>
                  Provide information about your visit
                </div>
                <Form
                  layout="vertical"
                  onFinish={handleBookAppointment}
                  initialValues={{
                    selectedStudentId,
                    topic,
                    appointmentReason,
                  }}
                >
                  <Form.Item label="Patient Name *" required>
                    <Select
                      value={selectedStudentId || undefined}
                      onChange={(value) => setSelectedStudentId(value)}
                      placeholder="Select Student"
                      size="large"
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
                  <Form.Item label="Consultation Topic" required>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      size="large"
                      placeholder="e.g., Annual check-up, Vaccination, Health concern"
                    />
                  </Form.Item>
                  {/* Bạn có thể thêm các lựa chọn urgency level như ảnh mẫu */}
                  <Form.Item label="Reason for Visit *" required>
                    <Input.TextArea
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      size="large"
                      placeholder="Please describe your symptoms, concerns, or the purpose of this appointment..."
                      rows={3}
                    />
                  </Form.Item>
                  <Form.Item label="Date">
                    <Input value={dateRequest} readOnly size="large" />
                  </Form.Item>
                  <Form.Item label="Start Time">
                    <Input
                      value={appointmentStartTime || step2StartTime}
                      readOnly
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item label="End Time">
                    <Input
                      value={appointmentEndTime || step2EndTime}
                      readOnly
                      size="large"
                    />
                  </Form.Item>
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
                        borderRadius: 8,
                        background: "#fff",
                        color: "#1976d2",
                        border: "1px solid #1976d2",
                        fontWeight: 600,
                      }}
                    >
                      ← Previous
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        borderRadius: 8,
                        background: "#355383",
                        color: "#fff",
                        fontWeight: 600,
                        minWidth: 120,
                      }}
                    >
                      Next →
                    </Button>
                  </div>
                  {success && (
                    <p style={{color: "green", marginTop: 16}}>{success}</p>
                  )}
                </Form>
              </div>
              {/* RIGHT: SUMMARY */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    background: "#E6F4FF",
                    borderRadius: 16,
                    padding: 28,
                    marginBottom: 0,
                    boxShadow: "0 2px 8px #e0e7ef",
                    minWidth: 340,
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 18,
                    }}
                  >
                    <span
                      style={{
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
                      <i className="fa fa-user" />
                      {/* Hoặc dùng icon react: <AiOutlineUser /> */}
                      <AiOutlineUser style={{fontSize: 20, color: "#222"}} />
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
                      <div style={{fontWeight: 600, color: "#222"}}>Nurse</div>
                      <div style={{fontWeight: 700}}>
                        {nurseProfile?.fullName || "—"}
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
                    <div>
                      <div style={{fontWeight: 600, color: "#222"}}>Date</div>
                      <div style={{fontWeight: 700}}>{dateRequest}</div>
                    </div>
                  </div>

                  {/* Time */}
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
                        background: "#f3eaff",
                        color: "#a259e6",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      ⏰
                    </span>
                    <div>
                      <div style={{fontWeight: 600, color: "#222"}}>Time</div>
                      <div style={{fontWeight: 700}}>
                        {appointmentStartTime || step2StartTime || "--:--"}
                        {appointmentEndTime || step2EndTime
                          ? ` - ${appointmentEndTime || step2EndTime}`
                          : ""}
                      </div>
                    </div>
                  </div>

                  {/* Patient */}
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
                        background: "#fff4e6",
                        color: "#ff9900",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      🧑
                    </span>
                    <div>
                      <div style={{fontWeight: 600, color: "#222"}}>
                        Patient
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#888",
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

                  {/* Booking ID (nếu có) */}
                  {/* <div style={{borderTop: "1px solid #dde3ec", margin: "12px 0 0 0", paddingTop: 10, display: "flex", justifyContent: "space-between", color: "#555", fontSize: 15}}>
    <span>Booking ID</span>
    <span style={{fontWeight: 700}}>#BK-2025-001</span>
  </div> */}
                </div>
                <div
                  style={{
                    background: "#f7f1ff",
                    borderRadius: 12,
                    padding: 24,
                    textAlign: "center",
                    color: "#a259e6",
                    border: "1px solid #e0d7fa",
                  }}
                >
                  <div style={{fontSize: 32, marginBottom: 8}}>♡</div>
                  <div style={{fontWeight: 700, marginBottom: 8}}>
                    Need Help?
                  </div>
                  <div style={{marginBottom: 12, color: "#888"}}>
                    Our support team is here to assist you with your booking.
                  </div>
                  <Button
                    style={{
                      borderRadius: 8,
                      background: "#fff",
                      color: "#a259e6",
                      border: "1px solid #a259e6",
                      fontWeight: 600,
                    }}
                  >
                    Contact Support
                  </Button>
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
              <li>Phụ huynh vui lòng đặt lịch trước khi đến tư vấn</li>
              <li>Mỗi buổi tư vấn kéo dài tối đa 30 phút</li>
              <li>
                Trường hợp khẩn cấp, vui lòng liên hệ trực tiếp qua số điện
                thoại
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
