import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Card, Descriptions, Divider, List} from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useSelector} from "react-redux";

const DeclarationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
  const studentId = location.state?.studentId || selectedStudent?.studentId;
  const parentId = useSelector((state) => state.user?.userId);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [student, setStudent] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students/${studentId}`
        );
        setStudent(response.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudent(null);
      }
    };
    fetchStudent();
  }, [studentId, parentId]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/students/${studentId}/health-declarations`
        );
        setHealthDeclaration(response.data.healthDeclaration);
        setVaccinations(response.data.vaccinations || []);
        // console.log("Health Declaration Data:", response.data);
      } catch (error) {
        console.error("Error fetching health declaration:", error);
        setHealthDeclaration(null);
        setVaccinations([]);
        Swal.fire({
          icon: "error",
          title: "Cannot find health declaration",
          text: "Please try again or select another student.",
          confirmButtonText: "Back",
        }).then(() => {
          navigate("/parent/health-declaration/my-children");
        });
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]); // <-- chỉ để studentId

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!healthDeclaration) {
    return <div>No health declaration found.</div>;
  }

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <Card title="Your Children's Health Detail" style={{width: "100%"}}>
        <Descriptions column={1} labelStyle={{width: 400}} bordered>
          <Descriptions.Item label="Student Code">
            {student?.studentCode || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {student?.fullName || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {student?.dayOfBirth || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Class">
            {student?.grade?.trim() || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Declaration Date">
            {healthDeclaration.declarationDate}
          </Descriptions.Item>
          <Descriptions.Item label="Chronic Diseases">
            {healthDeclaration.chronicDiseases}
          </Descriptions.Item>
          <Descriptions.Item label="Drug Allergies">
            {healthDeclaration.drugAllergies}
          </Descriptions.Item>
          <Descriptions.Item label="Food Allergies">
            {healthDeclaration.foodAllergies}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {healthDeclaration.notes}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{marginTop: 32}}>
          Vaccinations
        </Divider>
        <List
          dataSource={vaccinations}
          bordered
          locale={{emptyText: "No vaccination information"}}
          renderItem={(item) => (
            <List.Item>
              <Descriptions column={4} size="small">
                <Descriptions.Item label="Vaccine Name">
                  {item.vaccineName}
                </Descriptions.Item>
                <Descriptions.Item label="Dose Number">
                  {item.doseNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Vaccinated Date">
                  {item.vaccinatedDate}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {item.notes || "-"}
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          )}
        />

        <div style={{display: "flex", gap: 20, marginTop: 24}}>
          <Button
            type="default"
            onClick={() => navigate("/parent/health-declaration/my-children")}
          >
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeclarationDetail;
