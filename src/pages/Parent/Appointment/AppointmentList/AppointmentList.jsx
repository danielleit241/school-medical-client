import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { useSelector, useDispatch } from "react-redux";
import { setListStudentParent } from "../../../../redux/feature/listStudentParent";
import { Card, Button, Form, Input, Select, Radio, Spin, Empty } from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import dayjs from "dayjs";

const { Option } = Select;

const AppointmentList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [nurse, setNurse] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [step, setStep] = useState(1);
    const [dateRequest, setDateRequest] = useState(() => {
        return dayjs().format("YYYY-MM-DD"); 
    });
    const [topic, setTopic] = useState('');
    const [appointmentStartTime, setAppointmentStartTime] = useState('');
    const [appointmentEndTime, setAppointmentEndTime] = useState('');
    const [appointmentReason, setAppointmentReason] = useState('');
    const [success, setSuccess] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [showList, setShowList] = useState(false);
    const [dotIndex, setDotIndex] = useState(0);

    const userId = useSelector((state) => state.user?.userId);
    const parentId = localStorage.getItem('parentId') || userId;
    console.log("Parent ID:", parentId);
    const listStudentParent = useSelector((state) => state.listStudentParent.listStudentParent);
    const studentId = listStudentParent.length > 0 ? listStudentParent[0].studentId : null;

    const [step2StartTime, setStep2StartTime] = useState('');
    const [step2EndTime, setStep2EndTime] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(studentId);

    // Tự động cập nhật ngày khi sang ngày mới
    useEffect(() => {
        const interval = setInterval(() => {
            const today = dayjs().format("YYYY-MM-DD");
            if (dateRequest !== today) {
                setDateRequest(today);
                setStep(1);
                setSelectedNurse(null);
                setStep2StartTime('');
                setStep2EndTime('');
                setAppointmentStartTime('');
                setAppointmentEndTime('');
            }
        }, 60 * 1000 * 86400); // kiểm tra mỗi phút
        return () => clearInterval(interval);
    }, [dateRequest]);

    useEffect(() => {
        const fetchNurse = async () => {
            try {
                const response = await axiosInstance.get('/api/nurses');
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
                const response = await axiosInstance.get(`/api/parents/${userId}/students`);
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
                const res = await axiosInstance.get(`/api/nurses/${selectedNurse.staffNurseId}/appointments`, {
                    params: { dateRequest, PageSize: 10, PageIndex: 1 }
                });
                const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                const slots = data.map(item => ({
                    start: item.appointmentStartTime?.slice(0,5),
                    end: item.appointmentEndTime?.slice(0,5),
                    date: item.appointmentDate
                }));
                setBookedSlots(slots);
            } catch {
                setBookedSlots([]);
            }
        };
        fetchBookedSlots();
    }, [selectedNurse, dateRequest]);

    const handleSelect = (nurse) => {
        setSelectedNurse(nurse);
        setStep(2);
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
                position: 'top-end',
                icon: 'error',
                title: 'Please fill in all required fields!',
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
            const res = await axiosInstance.post('/api/parents/appointments', payload);
            console.log("Appointment API response:", res);
            localStorage.setItem('appointmentId', res.data.notificationTypeId || res.data.appointmentId);
            console.log("Appointment ID:", res.data.notificationTypeId || res.data.appointmentId);
            const notificationRes = await axiosInstance.post('/api/notification/appointments/to-nurse', {
                notificationTypeId: res.data.notificationTypeId || res.data.appointmentId,
                senderId: userId,
                receiverId: selectedNurse.staffNurseId,
            });
            console.log("Notification API response:", notificationRes);
            setSuccess('Appointment booked successfully!');
            navigate("/parent/appointment-history");
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Appointment booked successfully!',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Appointment API error:", error);
            const errMsg =
                error.response?.data?.errors?.request?.[0] ||
                error.response?.data?.errors?.['$.appointmentStartTime']?.[0] ||
                error.response?.data?.message ||
                'Failed to book appointment!';
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
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
            const start = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            minute += 30;
            if (minute === 60) {
                hour += 1;
                minute = 0;
            }
            const end = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            slots.push({ start, end });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Hàm kiểm tra slot đã bị đặt chưa
    const isSlotBooked = (slot) => {
        const slotStart = slot.start.length === 5 ? slot.start : slot.start.slice(0,5);
        const slotEnd = slot.end.length === 5 ? slot.end : slot.end.slice(0,5);
        return bookedSlots.some(
            (b) =>
                b.start === slotStart &&
                b.end === slotEnd &&
                b.date === dateRequest
        );
    };

    // Hiện hiệu ứng 3 dấu chấm lần lượt trong 2s rồi show list
    useEffect(() => {
        setShowList(false);
        setDotIndex(0);
        let interval = null;
        let timeout = null;

        interval = setInterval(() => {
            setDotIndex(prev => (prev + 1) % 3);
        }, 200); // đổi dấu chấm mỗi 0.2s

        timeout = setTimeout(() => {
            setShowList(true);
            clearInterval(interval);
        }, 300); // tổng thời gian loading 0.3s

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []); // chỉ chạy 1 lần khi mount

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Appointment"
                extra={
                    (step === 2 || step === 3) && (
                        <Button
                            onClick={() => {
                                if (step === 2) {
                                    setStep(1);
                                    setSelectedNurse(null);
                                    setStep2StartTime('');
                                    setStep2EndTime('');
                                } else if (step === 3) {
                                    setStep(2);
                                }
                            }}
                        >
                            Go Back
                        </Button>
                    )
                }
                style={{ maxWidth: 1100, margin: "0 auto", borderRadius: 12, height: "100%" }}
            >
                {step === 1 && (
                    <>
                        <h3 style={{ marginBottom: 16 }}>Nurses List</h3>
                        {!showList ? (
                            <div style={{
                                    background: "#fff",
                                    borderRadius: 12,
                                    padding: 32,
                                    textAlign: "center",
                                    fontSize: 30, // tăng kích thước
                                    letterSpacing: 8,
                                    height: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900, // đậm hơn
                                    color: "#222", // màu đậm hơn
                                }}>
                                <span>
                                    <span style={{ opacity: dotIndex === 0 ? 1 : 0.3 }}>.</span>
                                    <span style={{ opacity: dotIndex === 1 ? 1 : 0.3 }}>.</span>
                                    <span style={{ opacity: dotIndex === 2 ? 1 : 0.3 }}>.</span>
                                </span>
                            </div>
                            ) : nurse.length === 0 ? (
                            <div style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
                                <Empty description="No Nurse found" />
                            </div>
                            ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                {nurse.map((n) => (
                                    <div
                                        key={n.staffNurseId || n.id}
                                        style={{
                                            width: "100%",
                                            background: "#fff",
                                            borderRadius: 12,
                                            boxShadow: "0 2px 8px #f0f1f2",
                                            padding: 24,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 0,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                                                Nurse: {n.fullName}
                                            </div>
                                            <div>
                                                <b>Phone:</b> {n.phoneNumber}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <Button
                                                color="default" variant="outlined"
                                                onClick={() => handleSelect(n)}
                                                style={{ minWidth: 100, borderRadius: 8, backgroundColor: "#355383", color: "#fff" }}
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {step === 2 && selectedNurse && (
                    <Form
                        layout="vertical"
                        onFinish={handleDateSubmit}
                        style={{ marginTop: 24 }}
                    >
                        <h3>Choose a time slot with {selectedNurse.fullName} on</h3>
                        <div style={{ marginBottom: 16 }}>
                            <b>Date:</b> {dateRequest}
                        </div>
                        {/* Không cho đổi ngày, chỉ chọn time */}
                        <Form.Item label="Select Time Slot" required>
                            {timeSlots.filter(slot => !isSlotBooked(slot)).length === 0 && (
                                <div style={{ color: "red", fontWeight: 600, marginBottom: 8 }}>
                                  This nurse's booking is over for today.
                                </div>
                              )}
                            <Radio.Group
                                style={{ display: "flex", flexDirection: "column", gap: 8 }}
                                onChange={e => {
                                    const slot = timeSlots.find(s => s.start === e.target.value);
                                    setStep2StartTime(slot.start);
                                    setStep2EndTime(slot.end);
                                }}
                                value={step2StartTime}
                            >
                                {timeSlots
                                    .filter(slot => !isSlotBooked(slot))
                                    .map((slot, idx) => (
                                        <Radio key={idx} value={slot.start}>
                                            {slot.start} - {slot.end}
                                        </Radio>
                                    ))}
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item>
                            <Button style={{ borderRadius: 8, backgroundColor: "#355383", color: "#fff" }} variant="solid" htmlType="submit" disabled={!step2StartTime || timeSlots.filter(slot => !isSlotBooked(slot)).length === 0}>
                                Continue
                            </Button>
                        </Form.Item>
                    </Form>
                )}
                {step === 3 && selectedNurse && (
                    <Form
                        layout="vertical"
                        onFinish={handleBookAppointment}
                        style={{ marginTop: 24 }}
                        initialValues={{
                            selectedStudentId,
                            topic,
                            appointmentReason,
                        }}
                    >
                        <h3>Book an appointment with {selectedNurse.fullName} on {dateRequest}</h3>
                        <Form.Item label="Select Student" required>
                            <Select
                                value={selectedStudentId || undefined}
                                onChange={value => setSelectedStudentId(value)}
                                placeholder="Select Student"
                            >
                                {listStudentParent.map((student) => (
                                    <Option key={student.studentId} value={student.studentId}>
                                        {student.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Topic" required>
                            <Input value={topic} onChange={e => setTopic(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Date">
                            <Input value={dateRequest} readOnly />
                        </Form.Item>
                        <Form.Item label="Start Time">
                            <Input value={appointmentStartTime} readOnly />
                        </Form.Item>
                        <Form.Item label="End Time">
                            <Input value={appointmentEndTime} readOnly />
                        </Form.Item>
                        <Form.Item label="Reason" required>
                            <Input value={appointmentReason} onChange={e => setAppointmentReason(e.target.value)} />
                        </Form.Item>
                        <Form.Item>
                            <Button style={{ borderRadius: 8, backgroundColor: "#355383", color: "#fff" }} variant="solid" htmlType="submit">
                                Book Appointment
                            </Button>
                        </Form.Item>
                        {success && <p style={{ color: 'green' }}>{success}</p>}
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default AppointmentList;
