import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { useSelector, useDispatch } from "react-redux";
import { setListStudentParent } from "../../../../redux/feature/listStudentParent";
import { Card, Button, Form, Input, Select, Radio, message, Alert, Spin, Empty } from "antd";
import "./index.scss";

const { Option } = Select;

const AppointmentList = () => {
    const dispatch = useDispatch();
    const [nurse, setNurse] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [step, setStep] = useState(1);
    const [dateRequest, setDateRequest] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // yyyy-MM-dd
    });
    const [topic, setTopic] = useState('');
    const [appointmentStartTime, setAppointmentStartTime] = useState('');
    const [appointmentEndTime, setAppointmentEndTime] = useState('');
    const [appointmentReason, setAppointmentReason] = useState('');
    const [success, setSuccess] = useState('');
    const [alert, setAlert] = useState({ type: '', message: '', show: false });
    const [bookedSlots, setBookedSlots] = useState([]);

    const userId = useSelector((state) => state.user?.userId);
    const listStudentParent = useSelector((state) => state.listStudentParent.listStudentParent);
    const studentId = listStudentParent.length > 0 ? listStudentParent[0].studentId : null;

    const [step2StartTime, setStep2StartTime] = useState('');
    const [step2EndTime, setStep2EndTime] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(studentId);

    // Tự động cập nhật ngày khi sang ngày mới
    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            if (dateRequest !== today) {
                setDateRequest(today);
                setStep(1);
                setSelectedNurse(null);
                setStep2StartTime('');
                setStep2EndTime('');
                setAppointmentStartTime('');
                setAppointmentEndTime('');
            }
        }, 60 * 1000); // kiểm tra mỗi phút
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
        setAlert({ type: 'info', message: `Selected nurse: ${nurse.fullName}`, show: true });
    };

    const handleDateSubmit = () => {
        setAppointmentStartTime(step2StartTime);
        setAppointmentEndTime(step2EndTime);
        setStep(3);
        setAlert({ type: 'info', message: `Selected time slot: ${step2StartTime} - ${step2EndTime}`, show: true });
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
            message.error('Please fill in all required fields!');
            setAlert({ type: 'error', message: 'Please fill in all required fields!', show: true });
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
            if (res.data && res.data.appointmentId) {
                localStorage.setItem('appointmentId', res.data.appointmentId);
            }
            setSuccess('Appointment booked successfully!');
            // Reset các state về ban đầu
            setStep(1);
            setSelectedNurse(null);
            setStep2StartTime('');
            setStep2EndTime('');
            setAppointmentStartTime('');
            setAppointmentEndTime('');
            message.success('Appointment booked successfully!');
            setAlert({ type: 'success', message: 'Appointment booked successfully!', show: true });
        } catch (error) {
            const errMsg =
                error.response?.data?.errors?.request?.[0] ||
                error.response?.data?.errors?.['$.appointmentStartTime']?.[0] ||
                error.response?.data?.message ||
                'Failed to book appointment!';
            message.error(errMsg);
            setAlert({ type: 'error', message: errMsg, show: true });
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

    return (
        <div style={{ padding: 24, minHeight: "100vh", background: "#f7f9fb" }}>
            {alert.show && (
                <div style={{
                    position: "fixed",
                    top: 140,
                    right: 0,
                    zIndex: 9999,
                    minWidth: 320
                }}>
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        showIcon
                        closable
                        onClose={() => setAlert({ ...alert, show: false })}
                    />
                </div>
            )}
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
                style={{ maxWidth: 900, margin: "0 auto", borderRadius: 12, minHeight: 600 }}
            >
                {step === 1 && (
                    <>
                        <h3 style={{ marginBottom: 16 }}>Nurses List</h3>
                        {nurse === null || nurse === undefined ? (
                            <div style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
                                <Spin />
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
                                                type="primary"
                                                onClick={() => handleSelect(n)}
                                                style={{ minWidth: 100, borderRadius: 8 }}
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
                                {timeSlots.filter(slot => !isSlotBooked(slot)).length === 0 && (
                                    <span style={{ color: "red" }}>All time slots are booked!</span>
                                )}
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={!step2StartTime}>
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
                            <Button type="primary" htmlType="submit">
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
