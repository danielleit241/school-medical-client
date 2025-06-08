import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {Card, Button, Row, Col} from "antd";
import {useNavigate} from "react-router-dom";

const MedicalChildren = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setData(response.data);
        dispatch(setListStudentParent(response.data));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setData([]);
      }
    };
    fetchApi();
  }, [parentId, dispatch]);

  return (
    <div
      style={{
        padding: "30px",
        height: "100%",
        borderRadius: "20px",
      }}
    >
      <h1>My Children</h1>
      <Row gutter={[16, 16]}>
        {data.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.studentId}>
            <Card
              title={item.fullName}
              style={{
                minHeight: 220,
                boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p>
                <b>Mã HS:</b> {item.studentCode}
              </p>
              <p>
                <b>Ngày sinh:</b> {item.dayOfBirth}
              </p>
              <p>
                <b>Lớp:</b> {item.grade.trim()}
              </p>
              <div style={{display: "flex", gap: 8, marginTop: 16}}>
                <Button
                  type="primary"
                  onClick={() => {
                    localStorage.setItem("studentId", item.studentId);
                    navigate("/parent/medical-event/children-event-list", {
                      state: {student: item},
                    });
                  }}
                >
                  View
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MedicalChildren;
