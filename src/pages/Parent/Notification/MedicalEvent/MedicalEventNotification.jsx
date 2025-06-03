import React from "react";
import { useSelector, useDispatch  } from "react-redux";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import { Card, List, Spin, Empty, Button, Tag, Descriptions, Divider } from 'antd';

const MedicalEventNotification = () => {
  const dispatch = useDispatch();
  const parentId = localStorage.getItem("userId");
  console.log("Parent ID:", parentId);
 const listStudentParent = useSelector((state) => state.listStudentParent.listStudentParent);
  const studentId = listStudentParent.length > 0 ? listStudentParent[0].studentId : null;
  console.log("Selected Student ID:", studentId);
  const [medicalInventory, setMedicalInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedMedicalEvent, setSelectedMedicalEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get(`/api/parents/${parentId}/students`);
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
    }, [dispatch, listStudentParent, parentId]);

  //step 1: Fetch medical events for the selected student
  useEffect(() => {
    if (step !== 1 || !studentId) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/parents/students/${studentId}/medical-events`, {
          params: { PageSize: 10, PageIndex: 1 }
        });
        const data = response.data;
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setMedicalInventory(arr);
      } catch (error) {
        console.error("Error fetching medical events:", error);
        setMedicalInventory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [studentId, step, parentId]);

  //step 2: Fetch details of a specific medical event
  const handleDetail = async (medicalEventId) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/api/parents/students/medical-events/${medicalEventId}`);
      setSelectedMedicalEvent(response.data);
      setStep(2);
    } catch (error) {
      console.error("Error fetching medical event details:", error);
      setSelectedMedicalEvent(null);
    } finally {
      setDetailLoading(false);
    }
  };


  return <div className="appointment-history-fullscreen">
      <Card
        title={step === 1 ? "Medical Event History" : "Medical Event Details"}
        className="appointment-history-card"
        extra={step === 2 && <Button onClick={() => setStep(1)}>Back</Button>}
      >
        {step === 1 ? (
          loading ? (
            <Spin />
          ) : medicalInventory.length === 0 ? (
            <Empty description="No medical events found" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={medicalInventory}
              renderItem={item => {               
                return (
                  <List.Item
                    key={item.medicalEventId}
                    className="appointment-history-row"
                  >
                    <div className="appointment-history-row-info">
                      <div><b>Student Name:</b> {item.student.fullName || "..."}</div>
                      <div><b>Type:</b> {item.type}</div>
                      <div><b>Location:</b> {item.location || "..."}</div>
                      <div><b>Severity Level:</b> {item.severityLevel || "..."}</div>
                    </div>
                    <div className="appointment-history-row-actions">
                      <Button onClick={() => handleDetail(item.medicalEventId)}>
                        Details
                      </Button>
                    </div>
                  </List.Item>
                );
              }}
            />
          )
        ) : (
          detailLoading || !selectedMedicalEvent ? (
            <Spin />
          ) : (
            <div>
              <Descriptions
                column={1}
                bordered
                labelStyle={{ width: 220, fontWeight: 600 }}
                contentStyle={{ fontWeight: 400 }}
                size="middle"
              >
                <Descriptions.Item label="Student Name">
                  {selectedMedicalEvent.student.fullName || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Nurse">
                  {selectedMedicalEvent.staffNurse.fullName || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Event Type">
                  {selectedMedicalEvent.type}
                </Descriptions.Item>
                <Descriptions.Item label="Event Description">
                  {selectedMedicalEvent.description || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedMedicalEvent.location || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Severity Level">
                  {selectedMedicalEvent.severityLevel || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {selectedMedicalEvent.notes || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Medical Request">
                  {selectedMedicalEvent.itemName || "..."}
                </Descriptions.Item>
                 <Descriptions.Item label="Purpose">
                  {selectedMedicalEvent.purpose || "..."}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
                <Button type="default" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            </div>
          )
        )}
      </Card>
    </div>;
};

export default MedicalEventNotification;
