import React, {useState, useEffect} from "react";
import {
  Button,
  Input,
  DatePicker,
  Card,
  Form,
  Select,
  Row,
  Col,
  Space,
} from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import Swal from "sweetalert2";

const {TextArea} = Input;

const CreateCampaign = () => {
  const [form] = Form.useForm();
  const [rounds, setRounds] = useState([
    {
      roundName: "",
      targetGrade: "",
      description: "",
      startTime: null,
      endTime: null,
      nurseId: "",
      startDate: null,
      endDate: null,
    },
  ]);
  const userId = useSelector((state) => state.user?.userId);
  const roleName = useSelector((state) => state.user?.role);
  const [profile, setProfile] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const defaultStartDate = dayjs().add(7, "day");
  const navigate = useNavigate();

  // Lấy profile user từ API
  useEffect(() => {
    if (userId) {
      axiosInstance.get(`/api/user-profile/${userId}`).then((res) => {
        setProfile(res.data);
      });
    }
  }, [userId]);
  // console.log("userId", userId);
  // console.log("profile", profile);
  // Lấy danh sách nurse
  useEffect(() => {
    axiosInstance.get("/api/nurses").then((res) => {
      setNurses(res.data || []);
    });
  }, []);
  // Lấy danh sách vaccine
  // console.log("nurses", nurses);
  useEffect(() => {
    axiosInstance.get("/api/vaccination-details").then((res) => {
      setVaccines(res.data?.items || []);
    });
  }, []);
  console.log("vaccines", vaccines);
  const addRound = () => {
    setRounds([
      ...rounds,
      {
        roundName: "",
        targetGrade: "",
        description: "",
        startTime: null,
        endTime: null,
        nurseId: "",
      },
    ]);
  };

  const removeRound = (idx) => {
    if (rounds.length === 1) return;
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleRoundChange = (idx, field, value) => {
    const newRounds = [...rounds];
    newRounds[idx][field] = value;
    setRounds(newRounds);
  };

  const onFinish = async (values) => {
    // const scheduleStart = values.startDate.startOf("day");
    // const scheduleEnd = values.endDate.startOf("day");

    // for (const [idx, r] of rounds.entries()) {
    //   if (
    //     r.startTime &&
    //     (r.startTime.isBefore(scheduleStart) ||
    //       r.startTime.isAfter(scheduleEnd))
    //   ) {
    //     message.error(
    //       `Round ${
    //         idx + 1
    //       }: Start Time must be within schedule's start and end date!`
    //     );
    //     return;
    //   }
    //   if (
    //     r.endTime &&
    //     (r.endTime.isBefore(scheduleStart) || r.endTime.isAfter(scheduleEnd))
    //   ) {
    //     message.error(
    //       `Round ${
    //         idx + 1
    //       }: End Time must be within schedule's start and end date!`
    //     );
    //     return;
    //   }
    // }

    setLoading(true);
    try {
      const payload = {
        vaccineId: values.vaccineId,
        title: values.title,
        description: values.description,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        createdBy: profile?.id || userId || "",
        vaccinationRounds: rounds.map((r) => ({
          roundName: r.roundName,
          targetGrade: r.targetGrade,
          description: r.description,
          startTime: r.startTime ? r.startTime.toISOString() : null,
          endTime: r.endTime ? r.endTime.toISOString() : null,
          nurseId: r.nurseId,
        })),
      };
      console.log("payload", payload);
      await axiosInstance.post("/api/vaccinations/schedules", payload);
      Swal.fire({
        icon: "success",
        title: "Create campaign successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate(`/${roleName}/campaign/vaccine-schedule-allround`);
      });
      form.resetFields();
      setRounds([
        {
          roundName: "",
          targetGrade: "",
          description: "",
          startTime: null,
          endTime: null,
          nurseId: "",
        },
      ]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create campaign failed!",
        text: err || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Đặt initialValues cho Form
  useEffect(() => {
    form.setFieldsValue({startDate: defaultStartDate});
  }, [form, defaultStartDate]);

  // Đảm bảo sau khi lấy profile từ API, bạn cũng set lại giá trị cho trường createdBy trong form:
  useEffect(() => {
    if (profile?.fullName) {
      form.setFieldsValue({createdBy: profile.fullName});
    }
  }, [profile, form]);

  return (
    <Card
      title="Create Vaccination Campaign"
      style={{maxWidth: 1200, margin: "32px auto"}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          title: "",
          description: "",
          startDate: defaultStartDate,
          endDate: null,
          vaccineId: "",
          createdBy: "",
        }}
      >
        <Row gutter={32}>
          {/* Thông tin schedule */}
          <Col span={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{required: true, message: "Please input title!"}]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Vaccine"
              name="vaccineId"
              rules={[{required: true, message: "Please select vaccine!"}]}
            >
              <Select placeholder="Select vaccine">
                {vaccines.map((vaccine) => (
                  <Select.Option
                    key={vaccine.vaccineId}
                    value={vaccine.vaccineId}
                  >
                    {vaccine.vaccineName} ({vaccine.vaccineCode})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Created By" name="createdBy">
              <Input
                value={profile?.fullName || ""}
                disabled
                placeholder="Loading..."
              />
            </Form.Item>
            <p style={{color: "red", fontSize: 14, marginBottom: 10}}>
              Note: The time can start 7 days after the vaccination schedule is
              created.
            </p>
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{required: true}]}
            >
              <DatePicker
                style={{width: "100%"}}
                value={form.getFieldValue("startDate")}
                onChange={(val) => form.setFieldsValue({startDate: val})}
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{required: true, message: "Please select end date!"}]}
            >
              <DatePicker style={{width: "100%"}} />
            </Form.Item>
          </Col>

          {/* Phần round */}
          <Col span={12}>
            <div style={{marginBottom: 16, fontWeight: 600}}>
              Vaccination Rounds
            </div>
            <Space direction="vertical" style={{width: "100%"}}>
              {rounds.map((round, idx) => (
                <Card
                  key={idx}
                  type="inner"
                  title={`Round ${idx + 1}`}
                  style={{marginBottom: 12, background: "#f6ffed"}}
                  extra={
                    rounds.length > 1 ? (
                      <Button
                        danger
                        size="small"
                        onClick={() => removeRound(idx)}
                      >
                        Remove
                      </Button>
                    ) : null
                  }
                >
                  <Input
                    placeholder="Round Name"
                    value={round.roundName}
                    onChange={(e) =>
                      handleRoundChange(idx, "roundName", e.target.value)
                    }
                    style={{marginBottom: 8}}
                  />
                  <Input
                    placeholder="Target Grade"
                    value={round.targetGrade}
                    onChange={(e) =>
                      handleRoundChange(idx, "targetGrade", e.target.value)
                    }
                    style={{marginBottom: 8}}
                  />
                  <TextArea
                    placeholder="Description"
                    value={round.description}
                    onChange={(e) =>
                      handleRoundChange(idx, "description", e.target.value)
                    }
                    rows={2}
                    style={{marginBottom: 8}}
                  />
                  <DatePicker
                    showTime
                    placeholder="Start Time"
                    value={round.startTime}
                    onChange={(val) => handleRoundChange(idx, "startTime", val)}
                    style={{width: "100%", marginBottom: 8}}
                  />
                  <DatePicker
                    showTime
                    placeholder="End Time"
                    value={round.endTime}
                    onChange={(val) => handleRoundChange(idx, "endTime", val)}
                    style={{width: "100%", marginBottom: 8}}
                  />
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      marginBottom: 8,
                    }}
                  >
                    <select
                      value={round.nurseId || ""}
                      onChange={(e) =>
                        handleRoundChange(idx, "nurseId", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "8px 36px 8px 8px",
                        borderRadius: 4,
                        border: "1px solid #d9d9d9",
                        color: !round.nurseId ? "#ccc" : "#000",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        background: "white",
                      }}
                    >
                      <option value="" disabled style={{color: "#ccc"}}>
                        Select Nurse
                      </option>
                      {nurses.map((nurse) => (
                        <option
                          key={nurse.staffNurseId}
                          value={nurse.staffNurseId}
                          style={{color: "#000"}}
                        >
                          {nurse.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              ))}
              <Button type="dashed" onClick={addRound} style={{width: "100%"}}>
                + Add Round
              </Button>
            </Space>
          </Col>
        </Row>
        <div style={{textAlign: "center", marginTop: 24}}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Campaign
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CreateCampaign;
