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
const {Option} = Select;
const CreateCampaign = () => {
  const [form] = Form.useForm();
  const userId = useSelector((state) => state.user?.userId);
  const roleName = useSelector((state) => state.user?.role);
  const [profile, setProfile] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const defaultStartDate = dayjs().add(7, "day");
  const [classes, setClasses] = useState([]);
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
    axiosInstance.get("/api/vaccination-details/all").then((res) => {
      setVaccines(res.data || []);
    });
  }, []);
  // console.log("vaccines", vaccines);

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

  const validateSchedule = async () => {
    try {
      const values = form.getFieldsValue();
      const payloadWithCheckValidation = {
        vaccineId: values.vaccineId,
        vaccinationRounds: rounds.map((r) => ({
          roundName: r.roundName,
          targetGrade: r.targetGrade,
          description: r.description,
          startTime: r.startTime ? r.startTime.toISOString() : null,
          endTime: r.endTime ? r.endTime.toISOString() : null,
          nurseId: r.nurseId,
        })),
      };
      console.log("payloadWithCheckValidation", payloadWithCheckValidation);
      const res = await axiosInstance.post(
        "/api/vaccinations/schedules/is-valid",
        payloadWithCheckValidation
      );
      console.log("Validation response:", res.data);
      // Nếu đã tiêm vaccine đó cho lớp đó, trả về true
      if (res.data === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: error.message || "An error occurred during validation.",
      });
      return false;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const isValid = await validateSchedule();
      console.log("Validation result:", isValid);
      if (!isValid) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "This vaccine has already been scheduled for the selected class.",
        });
        setLoading(false);
        return;
      }
      const payload = {
        vaccineId: values.vaccineId,
        title: values.title,
        description: values.description,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        createdBy: userId || "",
        vaccinationRounds: rounds.map((r) => ({
          roundName: r.roundName,
          targetGrade: r.targetGrade,
          description: r.description,
          startTime: r.startTime ? r.startTime.toISOString() : null,
          endTime: r.endTime ? r.endTime.toISOString() : null,
          nurseId: r.nurseId,
        })),
      };
      await axiosInstance.post("/api/vaccinations/schedules", payload);
      Swal.fire({
        icon: "success",
        title: "Create campaign successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate(`/${roleName}/vaccine/vaccine-schedule`);
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
              Vaccination Rounds
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
                  {/* Thay thế Input bằng Select cho targetGrade */}
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
                      style={{width: "100%"}}
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
                  <Select
                    placeholder="Select Nurse"
                    value={round.nurseId || undefined}
                    onChange={(value) =>
                      handleRoundChange(idx, "nurseId", value)
                    }
                    style={{width: "100%", marginBottom: 8}}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input.toLowerCase()
                      )
                    }
                    options={nurses.map((nurse) => ({
                      value: nurse.staffNurseId,
                      label: nurse.fullName,
                    }))}
                  />
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
