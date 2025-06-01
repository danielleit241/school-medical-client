import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {Card, Button, Row, Col} from "antd";
import {useNavigate} from "react-router-dom";

const MyChildren = () => {
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
      } catch (error) {
        console.error("Error fetching children data:", error);
        setData([]);
      }
    };
    fetchApi();
  }, [parentId, dispatch]);
  // console.log(data);
  return (
    <div
      style={{
        padding: "30px",
        background: "#ffffff",
        height: "100%",
        borderRadius: "20px",
        boxShadow: "0 0px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1>My Children</h1>
      <Row gutter={[16, 16]}>
        {data.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.studentId}>
            <Card title={item.fullName} style={{minHeight: 220}}>
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
                  style={{background: "#355383"}}
                  onClick={() => {
                    navigate(`/parent/health-declaration/declaration-form`, {
                      state: {
                        studentId: item.studentId,
                        fullName: item.fullName,
                      },
                    });
                  }}
                >
                  Declare
                </Button>
                <Button
                  onClick={() => {
                    navigate(`/parent/health-declaration/detail`, {
                      state: {
                        studentId: item.studentId,
                        fullName: item.fullName,
                      },
                    });
                  }}
                >
                  Details
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyChildren;
