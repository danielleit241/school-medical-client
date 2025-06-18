import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import {Button, Table, Tag, Spin, Input, message} from "antd";
import HealthCheckModal from "./HealthCheckModal";
import Swal from "sweetalert2";

const HealthCheckDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const staffNurseId = useSelector((state) => state.user?.userId);
  const roundId = location.state?.roundId || localStorage.getItem("roundId");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [selectedRound, setSelectedRound] = useState(null);
  const [loadingMap] = useState({});
  const [status, setStatus] = useState(false); // trạng thái round
  const [loadingComplete, setLoadingComplete] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        PageSize: 10,
        PageIndex: 1,
      };
      if (searchText) params.Search = searchText;

      const res = await axiosInstance.get(
        `/api/nurses/${staffNurseId}/health-check-rounds/${roundId}/students`,
        {params}
      );

      const mappedStudents = (
        Array.isArray(res.data.items) ? res.data.items : []
      ).map((item) => ({
        studentCode: item.studentsOfRoundResponse.studentCode,
        studentName: item.studentsOfRoundResponse.fullName,
        grade: item.studentsOfRoundResponse.grade,
        gender: item.studentsOfRoundResponse.gender,
        dateOfBirth: item.studentsOfRoundResponse.dayOfBirth,
        parentPhoneNumber: item.parentsOfStudent.phoneNumber,
        healthCheckResultId: item.studentsOfRoundResponse.healthCheckResultId,
        ...item,
      }));

      setStudents(mappedStudents);
      console.log("Fetched students:", mappedStudents);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchRound = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/health-check-rounds/${roundId}`
        );
        setStatus(res.data.healthCheckRoundInformation.status);
        setSelectedRound(res.data.healthCheckRoundInformation);
        console.log(
          "Fetched round status:",
          res.data.healthCheckRoundInformation
        );
      } catch {
        setStatus(false);
        setSelectedRound(null);
      }
    };
    fetchRound();
  }, [roundId, staffNurseId]);

  useEffect(() => {
    fetchStudents();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, searchText, staffNurseId]);
  return <HealthCheckModal />;
};

export default HealthCheckDetail;
