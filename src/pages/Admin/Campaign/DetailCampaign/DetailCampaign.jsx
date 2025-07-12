import React, {useEffect, useState} from "react";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Spin,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Dropdown,
  Drawer,
  Divider,
} from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  DownOutlined,
  EditOutlined,
  BarcodeOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  NumberOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {useSelector} from "react-redux";
import Swal from "sweetalert2";

const {Title, Paragraph} = Typography;

const DetailCampaign = () => {
  const roleName = useSelector((state) => state.user?.role);
  const scheduleId = localStorage.getItem("vaccinationScheduleId");
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplementStudents, setSupplementStudents] = useState(null);
  const [sendNotiToParent, setSendNotiToParent] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [roundDetail, setRoundDetail] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);

  // Add round modal state
  const [addRoundModalVisible, setAddRoundModalVisible] = useState(false);
  const [addRoundLoading, setAddRoundLoading] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [formAddRound] = Form.useForm();

  const [toParentData, setToParentData] = useState([]);
  const [toNurseData, setToNurseData] = useState([]);
  const [roundsWithNurse, setRoundsWithNurse] = useState([]);
  const [classes, setClasses] = useState([]); // Thêm state để lưu danh sách lớp
  const [roundsWithStudents, setRoundsWithStudents] = useState(new Set());

  // Edit round modal state
  const [editRoundModalVisible, setEditRoundModalVisible] = useState(false);
  const [editRoundLoading, setEditRoundLoading] = useState(false);
  const [editRoundData, setEditRoundData] = useState(null);
  const [formEditRound] = Form.useForm();

  // Thêm hàm lấy profile nurse cho từng round
  const fetchRoundsWithNurse = async (rounds) => {
    const roundsData = await Promise.all(
      rounds.map(async (round) => {
        if (round.nurseId) {
          try {
            const nurseRes = await axiosInstance.get(
              `/api/user-profile/${round.nurseId}`
            );
            return {...round, nurseProfile: nurseRes.data};
          } catch {
            return {...round, nurseProfile: null};
          }
        }
        return {...round, nurseProfile: null};
      })
    );
    setRoundsWithNurse(roundsData);
  };

  // 1. Thêm useEffect để đọc dữ liệu từ localStorage
  useEffect(() => {
    if (scheduleId) {
      // Load notification data from localStorage
      try {
        const savedToParent = localStorage.getItem(
          `toParentData_${scheduleId}`
        );
        const savedToNurse = localStorage.getItem(`toNurseData_${scheduleId}`);

        if (savedToParent) {
          setToParentData(JSON.parse(savedToParent));
        }

        if (savedToNurse) {
          setToNurseData(JSON.parse(savedToNurse));
        }
      } catch (error) {
        console.error(
          "Error loading notification data from localStorage:",
          error
        );
      }

      // Fetch schedule data
      axiosInstance
        .get(`/api/vaccinations/schedules/${scheduleId}`)
        .then(async (res) => {
          setDetail(res.data);
          const rounds = res.data.vaccinationRounds || [];
          await fetchRoundsWithNurse(rounds);
        })
        .finally(() => setLoading(false));
    }
  }, [scheduleId]);

  // Fetch danh sách lớp khi component mount
  useEffect(() => {
    axiosInstance
      .get("/api/students/classes")
      .then((res) => {
        const formattedClasses = res.data.map((cls) => cls.trim());
        setClasses(formattedClasses);
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
        setClasses([]);
      });
  }, []);

  const handleBack = () => {
    localStorage.removeItem("scheduleId");
    navigate(`/${roleName}/vaccine/vaccine-schedule`);
  };

  const handleRoundDetail = (roundId) => {
    setModalVisible(true);
    setRoundLoading(true);

    axiosInstance
      .get(`/api/vaccination-rounds/${roundId}`)
      .then((res) => {
        setRoundDetail(res.data);
        // Không cần gọi API lấy profile nurse nữa vì đã có trong response
      })
      .finally(() => setRoundLoading(false));
  };

  // Thêm state để quản lý loại modal
  const [modalType, setModalType] = useState("new"); // "new" hoặc "supplement"

  // Add round
  const openAddRoundModal = async (type) => {
    setModalType(type); // "new" hoặc "supplement"
    setAddRoundModalVisible(true);

    // Nếu là supplement round, tự động set targetGrade là "Supplement"
    if (type === "supplement") {
      formAddRound.setFieldsValue({
        roundName: `Supplement Round`,
        targetGrade: "Supplement",
      });
    } else {
      // Đối với new round, chỉ cần reset form mà không cần set targetGrade
      formAddRound.resetFields();
    }

    // Lấy danh sách nurse
    try {
      const res = await axiosInstance.get("/api/nurses");
      setNurses(res.data || []);
    } catch {
      setNurses([]);
    }
  };

  const handleAddRound = async () => {
    try {
      setAddRoundLoading(true);
      const values = await formAddRound.validateFields();

      const res = await axiosInstance.get(
        `/api/schedules/${scheduleId}/vaccination-rounds`
      );
      const rounds = Array.isArray(res.data) ? res.data : [];

      // Validate targetGrade trùng
      const existed = rounds.some(
        (r) =>
          r.vaccinationRoundInformation?.targetGrade?.trim().toLowerCase() ===
          values.targetGrade.trim().toLowerCase()
      );
      if (existed) {
        formAddRound.setFields([
          {
            name: "targetGrade",
            errors: ["This target grade already exists in another round!"],
          },
        ]);
        setAddRoundLoading(false);
        return;
      }

      // Validate startTime, endTime
      let maxEndTime = null;
      if (rounds.length > 0) {
        maxEndTime = rounds
          .map((r) => r.vaccinationRoundInformation?.endTime)
          .filter(Boolean)
          .map((t) => dayjs(t))
          .sort((a, b) => b.valueOf() - a.valueOf())[0];

        const newStart = values.startTime;
        const newEnd = values.endTime;

        if (modalType === "supplement") {
          // Supplement: chỉ được tạo sau ngày maxEndTime
          if (
            !newStart.isAfter(maxEndTime, "day") ||
            !newEnd.isAfter(maxEndTime, "day")
          ) {
            formAddRound.setFields([
              {
                name: "startTime",
                errors: [
                  "Start time must be after all existing rounds (next day).",
                ],
              },
              {
                name: "endTime",
                errors: [
                  "End time must be after all existing rounds (next day).",
                ],
              },
            ]);
            setAddRoundLoading(false);
            return;
          }
        }
        if (modalType === "new") {
          // New round: cho phép cùng ngày, nhưng không cho nurse trùng nếu time giao nhau
          if (
            newStart.isSame(maxEndTime, "day") ||
            newEnd.isSame(maxEndTime, "day")
          ) {
            const overlap = rounds.some((r) => {
              const rNurseId = String(r.nurseId || r.nurse?.nurseId || "");
              const formNurseId = String(values.nurseId || "");
              const rStart = r.vaccinationRoundInformation?.startTime
                ? dayjs(r.vaccinationRoundInformation.startTime)
                : null;
              const rEnd = r.vaccinationRoundInformation?.endTime
                ? dayjs(r.vaccinationRoundInformation.endTime)
                : null;

              return (
                rNurseId === formNurseId &&
                rStart &&
                rEnd &&
                newStart.isBefore(rEnd) &&
                newEnd.isAfter(rStart)
              );
            });
            if (overlap) {
              formAddRound.setFields([
                {
                  name: "startTime",
                  errors: [
                    "This nurse already has a round in this time range.",
                  ],
                },
                {
                  name: "endTime",
                  errors: [
                    "This nurse already has a round in this time range.",
                  ],
                },
              ]);
              setAddRoundLoading(false);
              return;
            }
          }
        }
      }

      await axiosInstance.post("/api/schedules/vaccination-rounds", {
        scheduleId,
        roundName: values.roundName,
        targetGrade: values.targetGrade,
        description: values.description,
        startTime: values.startTime.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: values.endTime.format("YYYY-MM-DDTHH:mm:ss"),
        nurseId: values.nurseId,
      });
      message.success("Add round successfully!");
      setAddRoundModalVisible(false);
      formAddRound.resetFields();

      // Reload data with loading indicator
      setLoading(true);

      try {
        // Get updated schedule details
        const scheduleRes = await axiosInstance.get(
          `/api/vaccinations/schedules/${scheduleId}`
        );
        setDetail(scheduleRes.data);

        // Update rounds with nurse data
        if (scheduleRes.data && scheduleRes.data.vaccinationRounds) {
          await fetchRoundsWithNurse(scheduleRes.data.vaccinationRounds);
        }
      } catch (refreshErr) {
        console.error("Error refreshing data:", refreshErr);
        message.error(
          "Failed to refresh data. Please reload the page manually."
        );
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error adding round:", err);
      message.error("Add round failed!");
    } finally {
      setAddRoundLoading(false);
    }
  };

  // Hàm add student, chỉ lưu lại dữ liệu notification
  const handleAddStudent = async () => {
    try {
      const res = await axiosInstance.post(
        "/api/vaccination/schedules/add-students",
        scheduleId
      );
      const {toParent = [], toNurse = []} = res.data || {};

      // Lưu vào state
      setToParentData(toParent);
      setToNurseData(toNurse);

      // Lưu vào localStorage để tránh mất dữ liệu khi refresh
      localStorage.setItem(
        `toParentData_${scheduleId}`,
        JSON.stringify(toParent)
      );
      localStorage.setItem(
        `toNurseData_${scheduleId}`,
        JSON.stringify(toNurse)
      );

      Swal.fire({
        icon: "success",
        title: "Students added!",
        html: `
        <div>
          <b>To Parent:</b> ${toParent.length} notification(s)<br/>
          <b>To Nurse:</b> ${toNurse.length} notification(s)<br/>
          <span style="color:#1677ff">Now you can send notifications below.</span>
        </div>
      `,
        showConfirmButton: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Add students failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Hàm gửi notification chung
  const sendNotification = async (type, data) => {
    if (!Array.isArray(data) || data.length === 0) return;
    const url =
      type === "parent"
        ? "/api/notifications/vaccinations/to-parent"
        : "/api/notifications/vaccinations/to-nurse";
    await axiosInstance.post(url, data);
  };

  // Hàm gửi notification cho nurse
  const handleSendNotiNurse = async (dataToSend = null) => {
    try {
      // Sử dụng dữ liệu được truyền vào hoặc từ state
      const data = dataToSend || toNurseData;

      if (data.length > 0) {
        await sendNotification("nurse", data);
        Swal.fire({
          icon: "success",
          title: "Sent notifications to nurses successfully!",
          showConfirmButton: false,
          timer: 1800,
        });
        setToNurseData([]);
        // Xóa khỏi localStorage sau khi gửi thành công
        localStorage.removeItem(`toNurseData_${scheduleId}`);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Send notifications to nurses failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Hàm gửi notification cho parent
  const handleSendNotiParent = async (dataToSend = null) => {
    try {
      // Sử dụng dữ liệu được truyền vào hoặc từ state
      const data = dataToSend || toParentData;

      if (data.length > 0) {
        await sendNotification("parent", data);
        Swal.fire({
          icon: "success",
          title: "Sent notifications to parents successfully!",
          showConfirmButton: false,
          timer: 1800,
        });
        setToParentData([]);
        setSendNotiToParent(true);
        // Xóa khỏi localStorage sau khi gửi thành công
        localStorage.removeItem(`toParentData_${scheduleId}`);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Send notifications to parents failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // 3. Sửa hàm handleModalClose để không làm mất dữ liệu thông báo
  const handleModalClose = () => {
    setModalVisible(false);
    setRoundDetail(null);
    // KHÔNG reset các state toParentData và toNurseData ở đây
  };

  // 4. Khi hàm handleShowStudentList được gọi, cần đảm bảo không mất dữ liệu thông báo
  const handleShowStudentList = (roundId) => {
    localStorage.setItem("selectedVaccinationRoundId", roundId);
    // Lưu state hiện tại của các notification trước khi chuyển trang
    localStorage.setItem(
      `toParentData_${scheduleId}`,
      JSON.stringify(toParentData)
    );
    localStorage.setItem(
      `toNurseData_${scheduleId}`,
      JSON.stringify(toNurseData)
    );
    navigate(`/${roleName}/vaccine/vaccine-round/student-list`);
  };

  // Handle open edit round modal
  const handleEditRound = async (round) => {
    setEditRoundData(round);

    const hasStudents = await checkRoundHasStudents(round.roundId);

    if (hasStudents) {
      setRoundsWithStudents((prev) => {
        const newSet = new Set([...prev, round.roundId]);
        return newSet;
      });
    }

    setEditRoundModalVisible(true);

    // Lấy lại danh sách nurse mới nhất trước khi setFieldsValue
    try {
      const res = await axiosInstance.get("/api/nurses");
      setNurses(res.data || []);
    } catch {
      setNurses([]);
    }

    // Đảm bảo setFieldsValue sau khi đã có nurses
    setTimeout(() => {
      formEditRound.setFieldsValue({
        roundName: round.roundName,
        targetGrade: round.targetGrade,
        description: round.description,
        startTime: dayjs(round.startTime),
        endTime: dayjs(round.endTime),
        nurseId: round.nurseId || undefined,
      });
    }, 0);
  };

  const checkRoundHasStudents = async (roundId) => {
    try {
      const response = await axiosInstance.get(
        `/api/managers/vaccination-rounds/${roundId}/students`
      );
      const data = response.data;

      const hasStudents = data && data.count > 0;

      return hasStudents;
    } catch (error) {
      console.error(`Error checking students in round ${roundId}:`, error);
      return false;
    }
  };

  const isRoundHasStudents = (roundId) => {
    return roundsWithStudents.has(roundId);
  };

  // Handle submit edit round
  const handleSubmitEditRound = async () => {
    try {
      setEditRoundLoading(true);
      const values = await formEditRound.validateFields();
      const isSupplementRound =
        values.roundName?.trim().toLowerCase() === "supplement round";
      if (isSupplementRound) {
        // Lấy maxEndTime của các round khác (trừ round đang sửa)
        const maxEndTime = roundsWithNurse
          .filter((r) => r.roundId !== editRoundData.roundId)
          .map((r) =>
            r.endTime
              ? dayjs(r.endTime)
              : r.vaccinationRoundInformation?.endTime
              ? dayjs(r.vaccinationRoundInformation.endTime)
              : null
          )
          .filter(Boolean)
          .sort((a, b) => b.valueOf() - a.valueOf())[0];

        if (maxEndTime) {
          const newStart = values.startTime;
          const newEnd = values.endTime;
          if (
            !newStart.isAfter(maxEndTime, "day") ||
            !newEnd.isAfter(maxEndTime, "day")
          ) {
            formEditRound.setFields([
              {
                name: "startTime",
                errors: [
                  "Start time must be after all existing rounds (next day).",
                ],
              },
              {
                name: "endTime",
                errors: [
                  "End time must be after all existing rounds (next day).",
                ],
              },
            ]);
            setEditRoundLoading(false);
            return;
          }
        }
      }

      // Validate targetGrade trùng (trừ chính round đang sửa)
      const existed = roundsWithNurse.some(
        (r) =>
          r.roundId !== editRoundData.roundId &&
          r.targetGrade?.trim().toLowerCase() ===
            values.targetGrade.trim().toLowerCase()
      );
      if (existed) {
        formEditRound.setFields([
          {
            name: "targetGrade",
            errors: ["This target grade already exists in another round!"],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }

      // Không cho sửa thành Supplement nếu đã có Supplement Round khác
      const isEditingToSupplement =
        values.targetGrade.trim().toLowerCase() === "supplement";
      const hasOtherSupplement = roundsWithNurse.some(
        (r) =>
          r.roundId !== editRoundData.roundId &&
          (r.targetGrade?.trim().toLowerCase() === "supplement" ||
            r.vaccinationRoundInformation?.targetGrade?.trim().toLowerCase() ===
              "supplement")
      );
      if (isEditingToSupplement && hasOtherSupplement) {
        formEditRound.setFields([
          {
            name: "targetGrade",
            errors: ["There is already a Supplement round!"],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }

      // Validate nurse trùng lịch (không tính round đang sửa)
      const overlap = roundsWithNurse.some((r) => {
        if (r.roundId === editRoundData.roundId) return false;
        const rNurseId = String(r.nurseId || r.nurse?.nurseId || "");
        const formNurseId = String(values.nurseId || "");
        const rStart = r.startTime ? dayjs(r.startTime) : null;
        const rEnd = r.endTime ? dayjs(r.endTime) : null;
        const newStart = values.startTime;
        const newEnd = values.endTime;
        // Chỉ kiểm tra nếu cùng ngày
        const isSameDay = rStart && newStart && rStart.isSame(newStart, "day");
        return (
          rNurseId === formNurseId &&
          isSameDay &&
          rStart &&
          rEnd &&
          newStart.isBefore(rEnd) &&
          newEnd.isAfter(rStart)
        );
      });
      if (overlap) {
        formEditRound.setFields([
          {
            name: "startTime",
            errors: [
              "This nurse already has a round in this time range on this day.",
            ],
          },
          {
            name: "endTime",
            errors: [
              "This nurse already has a round in this time range on this day.",
            ],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }

      await axiosInstance.put(
        `/api/vaccination-rounds/${editRoundData.roundId}`,
        {
          roundName: values.roundName,
          targetGrade: values.targetGrade,
          description: values.description,
          startTime: values.startTime.format("YYYY-MM-DDTHH:mm:ss"),
          endTime: values.endTime.format("YYYY-MM-DDTHH:mm:ss"),
          nurseId: values.nurseId,
        }
      );
      message.success("Edit round successfully!");
      setEditRoundModalVisible(false);
      formEditRound.resetFields();
      // Reload rounds
      setLoading(true);
      const scheduleRes = await axiosInstance.get(
        `/api/vaccinations/schedules/${scheduleId}`
      );
      setDetail(scheduleRes.data);
      if (scheduleRes.data && scheduleRes.data.vaccinationRounds) {
        await fetchRoundsWithNurse(scheduleRes.data.vaccinationRounds);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error editing round:", err);
      message.error("Edit round failed!");
    } finally {
      setEditRoundLoading(false);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      axiosInstance
        .get(
          `/api/schedules/${scheduleId}/vaccination-rounds/supplementary/total-students`
        )
        .then((res) => setSupplementStudents(res.data?.supplementStudents ?? 0))
        .catch(() => setSupplementStudents(0));
    }
  }, [scheduleId]);

  const [drawerVisible, setDrawerVisible] = useState(false);

  // Drawer open/close handlers
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  if (loading) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>No data found.</div>
    );
  }

  const vaccine = detail.vaccinationDetailsResponse;

  const hasSupplementRound = roundsWithNurse.some((r) => {
    const name = r.vaccinationRoundInformation?.roundName || r.roundName || "";
    return name.trim().toLowerCase() === "supplement round";
  });

  const disableSupplementRound =
    roundsWithNurse.some(
      (r) =>
        r.vaccinationRoundInformation?.status === false || r.status === false
    ) || supplementStudents === 0;

  return (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center"}}>
          <Button
            icon={<ArrowLeftOutlined style={{margin: 0, padding: 0}} />}
            onClick={handleBack}
            style={{
              marginRight: 16,
            }}
          />
          <span>Vaccination Campaign Details</span>
        </div>
      }
      style={{margin: 24}}
      extra={
        <Space>
          <Button
            icon={
              <EyeOutlined style={{display: "flex", alignItems: "center"}} />
            }
            onClick={showDrawer}
          >
            View
          </Button>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: (
                    <span style={hasSupplementRound ? {color: "#aaa"} : {}}>
                      Add New Round
                    </span>
                  ),
                  onClick: () => {
                    if (!hasSupplementRound) openAddRoundModal("new");
                  },
                  disabled: hasSupplementRound,
                },
                {
                  key: "2",
                  label: (
                    <span
                      style={
                        hasSupplementRound || supplementStudents === 0
                          ? {color: "#aaa"}
                          : {}
                      }
                    >
                      Add Supplement Round
                    </span>
                  ),
                  onClick: () => {
                    if (!hasSupplementRound && !disableSupplementRound)
                      openAddRoundModal("supplement");
                  },
                  disabled: hasSupplementRound || disableSupplementRound,
                },
              ],
            }}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              disabled={hasSupplementRound}
            >
              Add Round <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            style={{
              background: toNurseData.length === 0 ? "#d9d9d9" : "#355383",
              color: toNurseData.length === 0 ? "#00000040" : "#fff",
            }}
            type="primary"
            onClick={() => {
              // Đọc dữ liệu từ localStorage nếu state rỗng
              if (toNurseData.length === 0) {
                try {
                  const savedData = localStorage.getItem(
                    `toNurseData_${scheduleId}`
                  );
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setToNurseData(parsedData);
                    handleSendNotiNurse(parsedData);
                    return;
                  }
                } catch (error) {
                  console.error("Error parsing nurse data:", error);
                }
              }
              handleSendNotiNurse(toNurseData);
            }}
            disabled={
              toNurseData.length === 0 &&
              !localStorage.getItem(`toNurseData_${scheduleId}`)
            }
          >
            Send to Nurse
          </Button>

          <Button
            style={{
              background: toParentData.length === 0 ? "#d9d9d9" : "#355383",
              color: toParentData.length === 0 ? "#00000040" : "#fff",
            }}
            loading={sendNotiToParent}
            icon={sendNotiToParent ? <LoadingOutlined /> : null}
            type="primary"
            disabled={
              toParentData.length === 0 &&
              !localStorage.getItem(`toParentData_${scheduleId}`)
            }
            onClick={async () => {
              if (sendNotiToParent) return; // Đang gửi thì không cho bấm tiếp
              let dataToSend = toParentData;
              if (toParentData.length === 0) {
                try {
                  const savedData = localStorage.getItem(`toParentData_${scheduleId}`);
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setToParentData(parsedData);
                    dataToSend = parsedData;
                  }
                } catch (error) {
                  console.error("Error parsing parent data:", error);
                }
              }
              if (dataToSend && dataToSend.length > 0) {
                setSendNotiToParent(true);
                try {
                  await handleSendNotiParent(dataToSend);
                } finally {
                  setSendNotiToParent(false);
                }
              }
            }}
          >
            Send to Parent
          </Button>
        </Space>
      }
    >
      <Title level={4}>Vaccination Rounds</Title>
      {roundsWithNurse.length === 0 && (
        <Paragraph>No rounds available.</Paragraph>
      )}
      <Row gutter={[16, 16]}>
        {roundsWithNurse.map((round, idx) => {
          const now = dayjs();
          const start = dayjs(round.startTime);
          const end = dayjs(round.endTime);
          const isEditingDisabled =
            now.isSame(start, "day") ||
            now.isSame(end, "day") ||
            (now.isAfter(start, "day") && now.isBefore(end, "day")) ||
            round.status === true;

          return (
            <Col xs={24} md={12} key={round.roundId}>
              <Card
                type="inner"
                title={`Round ${idx + 1}: ${round.roundName}`}
                style={{marginBottom: 16, background: "#E6F7FF"}}
                extra={
                  <Space>
                    {round.status ? (
                      <Tag color="green">Completed</Tag>
                    ) : (
                      <Tag color="orange">Not completed</Tag>
                    )}
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleRoundDetail(round.roundId)}
                    >
                      Detail
                    </Button>
                    <Button
                      size="small"
                      icon={<TeamOutlined />}
                      onClick={() => handleShowStudentList(round.roundId)}
                    >
                      List Students
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditRound(round)}
                      disabled={isEditingDisabled}
                      title={
                        isEditingDisabled
                          ? "Cannot edit during round time or after completed"
                          : "Edit"
                      }
                    >
                      Edit
                    </Button>
                  </Space>
                }
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Target Grade">
                    {round.targetGrade}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {round.description || "None"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Time">
                    {round.startTime
                      ? dayjs(round.startTime).format("YYYY-MM-DD HH:mm")
                      : ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Time">
                    {round.endTime
                      ? dayjs(round.endTime).format("YYYY-MM-DD HH:mm")
                      : ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nurse">
                    {round.nurseProfile?.fullName || "Not assigned yet"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Drawer for Vaccine Information */}
      <Drawer
        title={
          <span>
            <SafetyCertificateOutlined
              style={{color: "#52c41a", marginRight: 8}}
            />
            Vaccine Information
          </span>
        }
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={500}
      >
        <div style={{padding: 8}}>
          <Typography.Title level={5} style={{marginBottom: 16}}>
            <InfoCircleOutlined style={{color: "#1890ff", marginRight: 8}} />
            General Info
          </Typography.Title>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <UserOutlined
              style={{fontSize: 20, color: "#722ed1", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Vaccine Name:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.vaccineName || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <BarcodeOutlined
              style={{fontSize: 20, color: "#faad14", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Vaccine Code:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.vaccineCode || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <ApartmentOutlined
              style={{fontSize: 20, color: "#13c2c2", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Manufacturer:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.manufacturer || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <FileTextOutlined
              style={{fontSize: 20, color: "#eb2f96", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Vaccine Type:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.vaccineType || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <NumberOutlined
              style={{fontSize: 20, color: "#1890ff", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Batch Number:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.batchNumber || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <CalendarOutlined
              style={{fontSize: 20, color: "#fa541c", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>
              Expiration Date:
            </span>
            <span style={{marginLeft: 8}}>
              {vaccine.expirationDate || <i>None</i>}
            </span>
          </div>
          <div
            style={{display: "flex", alignItems: "center", marginBottom: 12}}
          >
            <ClockCircleOutlined
              style={{fontSize: 20, color: "#52c41a", marginRight: 10}}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>
              Age Recommendation:
            </span>
            <span style={{marginLeft: 8}}>
              {vaccine.ageRecommendation || <i>None</i>}
            </span>
          </div>
          <Divider />
          <Typography.Title level={5} style={{marginBottom: 16}}>
            <ExclamationCircleOutlined
              style={{color: "#fa541c", marginRight: 8}}
            />
            Notes
          </Typography.Title>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <ExclamationCircleOutlined
              style={{
                fontSize: 20,
                color: "#faad14",
                marginRight: 10,
                marginTop: 2,
              }}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>
              Contraindication:
            </span>
            <span style={{marginLeft: 8}}>
              {vaccine.contraindicationNotes || <i>None</i>}
            </span>
          </div>
          <div style={{display: "flex", alignItems: "flex-start"}}>
            <FileTextOutlined
              style={{
                fontSize: 20,
                color: "#1890ff",
                marginRight: 10,
                marginTop: 2,
              }}
            />
            <span style={{fontWeight: 500, minWidth: 120}}>Description:</span>
            <span style={{marginLeft: 8}}>
              {vaccine.description || <i>None</i>}
            </span>
          </div>
        </div>
      </Drawer>

      {/* Modal for round detail */}
      <Modal
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        title="Vaccination Round Detail"
      >
        {roundLoading ? (
          <Spin />
        ) : roundDetail ? (
          <>
            <Descriptions
              column={1}
              bordered
              size="small"
              title="Round Information"
            >
              <Descriptions.Item label="Round Name">
                {roundDetail.vaccinationRoundInformation?.roundName}
              </Descriptions.Item>
              <Descriptions.Item label="Target Grade">
                {roundDetail.vaccinationRoundInformation?.targetGrade}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {roundDetail.vaccinationRoundInformation?.description || "None"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Time">
                {roundDetail.vaccinationRoundInformation?.startTime
                  ? dayjs(
                      roundDetail.vaccinationRoundInformation.startTime
                    ).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="End Time">
                {roundDetail.vaccinationRoundInformation?.endTime
                  ? dayjs(
                      roundDetail.vaccinationRoundInformation.endTime
                    ).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {roundDetail.vaccinationRoundInformation?.status ? (
                  <Tag color="green">Completed</Tag>
                ) : (
                  <Tag color="orange">Not completed</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions
              column={1}
              bordered
              size="small"
              title="Nurse Information"
              style={{marginTop: 16}}
            >
              <Descriptions.Item label="Nurse Name">
                {roundDetail.nurse?.nurseName || "Not assigned"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {roundDetail.nurse?.phoneNumber || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Paragraph>No data found.</Paragraph>
        )}
      </Modal>

      {/* Modal for add round */}
      <Modal
        open={addRoundModalVisible}
        title={
          modalType === "new"
            ? "Add New Vaccination Round"
            : "Add Supplement Vaccination Round"
        }
        onCancel={() => setAddRoundModalVisible(false)}
        onOk={handleAddRound}
        confirmLoading={addRoundLoading}
        okText="Add"
        width={600}
      >
        <Form form={formAddRound} layout="vertical">
          <Form.Item
            label="Round Name"
            name="roundName"
            rules={[{required: true, message: "Please input round name!"}]}
          >
            <Input />
          </Form.Item>

          {/* Thay đổi target grade thành Select cho new round hoặc Input disabled cho supplement round */}
          <Form.Item
            label="Target Grade"
            name="targetGrade"
            rules={[{required: true, message: "Please select target grade!"}]}
          >
            {modalType === "new" ? (
              <Select
                placeholder="Select class"
                showSearch
                filterOption={(input, option) =>
                  (option?.value ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {classes.map((cls) => (
                  <Select.Option key={cls} value={cls}>
                    {cls}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input disabled={true} />
            )}
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{required: true, message: "Please select start time!"}]}
          >
            <DatePicker showTime style={{width: "100%"}} />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{required: true, message: "Please select end time!"}]}
          >
            <DatePicker showTime style={{width: "100%"}} />
          </Form.Item>
          <Form.Item
            label="Nurse"
            name="nurseId"
            rules={[{required: true, message: "Please select nurse!"}]}
          >
            <Select placeholder="Select nurse">
              {nurses.map((nurse) => (
                <Select.Option
                  key={nurse.staffNurseId}
                  value={nurse.staffNurseId}
                >
                  {nurse.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Round Modal */}
      <Modal
        open={editRoundModalVisible}
        title="Edit Vaccination Round"
        onCancel={() => setEditRoundModalVisible(false)}
        onOk={handleSubmitEditRound}
        confirmLoading={editRoundLoading}
        okText="Save"
        width={600}
      >
        <Form form={formEditRound} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Round Name"
                name="roundName"
                rules={[{required: true, message: "Please input round name!"}]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Target Grade"
                name="targetGrade"
                rules={[
                  {required: true, message: "Please select target grade!"},
                ]}
              >
                <Select
                  placeholder="Select class"
                  showSearch
                  disabled={
                    editRoundData
                      ? isRoundHasStudents(editRoundData.roundId)
                      : false
                  }
                  filterOption={(input, option) =>
                    (option?.value ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {classes.map((cls) => (
                    <Select.Option key={cls} value={cls}>
                      {cls}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {editRoundData && isRoundHasStudents(editRoundData.roundId) && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#d4380d",
                    marginTop: -20,
                    marginBottom: 16,
                  }}
                >
                  <ExclamationCircleOutlined style={{marginRight: 4}} />
                  Target Grade cannot be changed - this round already has
                  students
                </div>
              )}
            </Col>
          </Row>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[{required: true, message: "Please select start time!"}]}
              >
                <DatePicker showTime style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{required: true, message: "Please select end time!"}]}
              >
                <DatePicker showTime style={{width: "100%"}} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Nurse"
            name="nurseId"
            rules={[{required: true, message: "Please select nurse!"}]}
          >
            <Select placeholder="Select nurse">
              {nurses.map((nurse) => (
                <Select.Option
                  key={nurse.staffNurseId}
                  value={nurse.staffNurseId}
                >
                  {nurse.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DetailCampaign;
