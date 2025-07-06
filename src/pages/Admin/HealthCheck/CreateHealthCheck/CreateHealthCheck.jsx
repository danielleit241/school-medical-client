import React, {useEffect, useState} from "react";
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
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";

const {TextArea} = Input;

const CreateHealthCheck = () => {
  const [form] = Form.useForm();

  const userId = useSelector((state) => state.user?.userId);
  const roleName = useSelector((state) => state.user?.role);
  const [profile, setProfile] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const defaultStartDate = dayjs().add(7, "day");
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/api/students/classes")
      .then((res) => {
        const formattedClasses = res.data.map((cls) => cls.trim());
        setClasses(formattedClasses);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
        setClasses([]);
      });
  }, []);

  useEffect(() => {
    if (userId) {
      axiosInstance.get(`/api/user-profile/${userId}`).then((response) => {
        setProfile(response.data);
      });
    }
  }, [userId]);
  console.log("profile", profile);
  useEffect(() => {
    axiosInstance.get("/api/nurses").then((response) => {
      setNurses(response.data || []);
    });
  }, []);

  const [rounds, setRounds] = useState([
    {
      roundName: "",
      targetGrade: "",
      description: "",
      startTime: null,
      endTime: null,
      nurseId: "",
    },
  ]);

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

  const removeRound = (index) => {
    if (rounds.length === 1) return;
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...rounds];
    newRounds[index][field] = value;
    setRounds(newRounds);
  };

  const [healthCheckType, setHealthCheckType] = useState("General");

  const handleHealthCheckTypeChange = (value) => {
    setHealthCheckType(value);
    if (value !== "Other") {
      form.setFieldsValue({customHealthCheckType: undefined});
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const finalHealthCheckType =
        values.healthCheckType === "Other"
          ? values.customHealthCheckType
          : values.healthCheckType;

      const payload = {
        title: values.title,
        description: values.description,
        healthCheckType: finalHealthCheckType,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        createdBy: userId,
        healthCheckRounds: rounds.map((round) => ({
          roundName: round.roundName,
          targetGrade: round.targetGrade,
          description: round.description,
          startTime: round.startTime
            ? round.startTime.format("YYYY-MM-DDTHH:mm:ss")
            : null,
          endTime: round.endTime
            ? round.endTime.format("YYYY-MM-DDTHH:mm:ss")
            : null,
          nurseId: round.nurseId || null,
        })),
      };
      console.log("Payload to create health check campaign:", payload);
      await axiosInstance.post("/api/health-checks/schedules", payload);
      Swal.fire({
        icon: "success",
        title: "Create campaign successfully!",
        text: "Health check campaign has been created successfully.",
        timer: 1500,
      }).then(() => {
        navigate(`/${roleName}/health-check/schedules`);
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
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create campaign failed!",
        text: "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({startDate: defaultStartDate});
  }, [form, defaultStartDate]);

  useEffect(() => {
    if (profile?.fullName) {
      form.setFieldsValue({createdBy: profile.fullName});
    }
  }, [profile, form]);

  return (
    <Card
      title="Health Check Campaign"
      style={{maxWidth: 1200, margin: "32px auto"}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          title: "",
          description: "",
          healthCheckType: "General",
          startDate: defaultStartDate,
          endDate: null,
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
              label="Health Check Type"
              name="healthCheckType"
              rules={[
                {required: true, message: "Please select health check type!"},
              ]}
            >
              <Select onChange={handleHealthCheckTypeChange}>
                <Select.Option value="General">General Health</Select.Option>
                <Select.Option value="Dental">Vision</Select.Option>
                <Select.Option value="Vision">Dental Health</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>

            {healthCheckType === "Other" && (
              <Form.Item
                label="Other Health Check Type"
                name="customHealthCheckType"
                rules={[
                  {
                    required: true,
                    message: "Please specify the health check type!",
                  },
                ]}
              >
                <Input placeholder="Enter custom health check type" />
              </Form.Item>
            )}
            <Form.Item label="Created By" name="createdBy">
              <Input
                value={profile?.fullName || ""}
                disabled
                placeholder="Loading..."
              />
            </Form.Item>
            <p style={{color: "red", fontSize: 14, marginBottom: 10}}>
              Note: The time can start 7 days after the health check schedule is
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
              dependencies={["startDate"]}
              rules={[
                {required: true, message: "Please select end date!"},
                ({getFieldValue}) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate) return Promise.resolve();
                    // Đảm bảo value và startDate là dayjs object
                    const end = dayjs(value);
                    const start = dayjs(startDate);
                    if (!end.isValid() || !start.isValid())
                      return Promise.resolve();
                    if (end.isSameOrBefore(start, "day")) {
                      return Promise.reject(
                        new Error("End date must be after start date!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{width: "100%"}} />
            </Form.Item>
          </Col>

          {/* Phần round */}
          <Col span={12}>
            <div style={{marginBottom: 16, fontWeight: 600}}>
              Health Check Rounds
            </div>
            <Space direction="vertical" style={{width: "100%"}}>
              {rounds.map((round, idx) => (
                <Card
                  key={idx}
                  type="inner"
                  title={`Round ${idx + 1}`}
                  style={{marginBottom: 12, background: "#E6F7FF"}}
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
                  <Select
                    showSearch
                    placeholder="Select Target Grade"
                    value={round.targetGrade || undefined} // Quan trọng: đặt undefined khi không có giá trị
                    onChange={(value) =>
                      handleRoundChange(idx, "targetGrade", value)
                    }
                    style={{width: "100%", marginBottom: 8}}
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input.toLowerCase()
                      )
                    }
                    options={[
                      ...classes.map((cls) => ({
                        value: cls,
                        label: cls,
                      })),
                    ]}
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
                  <Form.Item
                    style={{marginBottom: 8}}
                    validateStatus={
                      round.startTime &&
                      (!form.getFieldValue("startDate") ||
                        dayjs(round.startTime).isBefore(
                          form.getFieldValue("startDate"),
                          "minute"
                        ) ||
                        (form.getFieldValue("endDate") &&
                          dayjs(round.startTime).isAfter(
                            form.getFieldValue("endDate"),
                            "minute"
                          )))
                        ? "error"
                        : ""
                    }
                    help={
                      round.startTime &&
                      (!form.getFieldValue("startDate")
                        ? "Please select campaign start date first."
                        : dayjs(round.startTime).isBefore(
                            form.getFieldValue("startDate"),
                            "minute"
                          )
                        ? "Round start time must be after or equal to campaign start date."
                        : form.getFieldValue("endDate") &&
                          dayjs(round.startTime).isAfter(
                            form.getFieldValue("endDate"),
                            "minute"
                          )
                        ? "Round start time must be before or equal to campaign end date."
                        : "")
                    }
                  >
                    <DatePicker
                      showTime
                      placeholder="Start Time"
                      value={round.startTime}
                      onChange={(val) =>
                        handleRoundChange(idx, "startTime", val)
                      }
                      style={{width: "100%", marginBottom: 8}}
                    />
                  </Form.Item>

                  <Form.Item
                    style={{marginBottom: 8}}
                    validateStatus={
                      round.endTime &&
                      (!form.getFieldValue("startDate") ||
                        dayjs(round.endTime).isBefore(
                          form.getFieldValue("startDate"),
                          "minute"
                        ) ||
                        (form.getFieldValue("endDate") &&
                          dayjs(round.endTime).isAfter(
                            form.getFieldValue("endDate"),
                            "minute"
                          )) ||
                        (round.startTime &&
                          dayjs(round.endTime).isSameOrBefore(
                            round.startTime,
                            "minute"
                          )))
                        ? "error"
                        : ""
                    }
                    help={
                      round.endTime &&
                      (!form.getFieldValue("startDate")
                        ? "Please select campaign start date first."
                        : dayjs(round.endTime).isBefore(
                            form.getFieldValue("startDate"),
                            "minute"
                          )
                        ? "Round end time must be after or equal to campaign start date."
                        : form.getFieldValue("endDate") &&
                          dayjs(round.endTime).isAfter(
                            form.getFieldValue("endDate"),
                            "minute"
                          )
                        ? "Round end time must be before or equal to campaign end date."
                        : round.startTime &&
                          dayjs(round.endTime).isSameOrBefore(
                            round.startTime,
                            "minute"
                          )
                        ? "Round end time must be after round start time."
                        : "")
                    }
                  >
                    <DatePicker
                      showTime
                      placeholder="End Time"
                      value={round.endTime}
                      onChange={(val) => handleRoundChange(idx, "endTime", val)}
                      style={{width: "100%"}}
                    />
                  </Form.Item>
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
          <Button
            style={{
              background: "#355383",
              borderColor: "#355383",
              color: "#fff",
            }}
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Create Campaign
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CreateHealthCheck;
