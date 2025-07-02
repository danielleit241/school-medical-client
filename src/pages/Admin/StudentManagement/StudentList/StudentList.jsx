import React, {useState, useEffect, useCallback} from "react";
import {Table, Input, Pagination, Spin, Alert, Button, Divider} from "antd";
import {SearchOutlined, DownloadOutlined, LoadingOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import StudentModal from "./StudentModal";
import {Search, Download} from "lucide-react";
import AddStudent from "../AddStudent/AddStudent";

const pageSize = 10;

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        Search: searchText,
      };
      const response = await axiosInstance.get("/api/students", {params});
      if (response.data.items && response.data.items.length > 0) {
        localStorage.setItem("studentId", response.data.items[0].studentId);
      }
      console.log("Fetched students:", response.data.items);
      setStudents(response.data.items || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      setError(err.response?.data || err.message || "Error fetching students");
      setStudents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, searchText]);

  useEffect(() => {
    fetchStudents();
  }, [pageIndex, fetchStudents, searchText]);

  const handleSendCreateAccount = async () => {
    if (students.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No students selected",
        toast: true,
        position: "top-end", // Góc phải trên
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    setCreatingAccount(true);
    try {
      await axiosInstance.post("/api/accounts/parents/batch-create");
      Swal.fire({
        icon: "success",
        title: "Accounts created successfully",
        toast: true,
        position: "top-end", // Góc phải trên
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error creating accounts:", error);
      Swal.fire({
        icon: "error",
        title: "Error creating accounts",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (students.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No students to download",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    try {
      const response = await axiosInstance.get("/api/students/export-excel", {
        responseType: "blob",
      });
      // Tạo link download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Hiển thị alert thành công
      Swal.fire({
        icon: "success",
        title: "Download successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      Swal.fire({
        icon: "error",
        title: "Download failed",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  const openEditModal = (studentId) => {
    setEditItemId(studentId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditItemId(null);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => (pageIndex - 1) * pageSize + index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Student Code",
      dataIndex: "studentCode",
      key: "studentCode",
      sorter: (a, b) => a.studentCode.localeCompare(b.studentCode),
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Date of Birth",
      dataIndex: "dayOfBirth",
      key: "dayOfBirth",
      render: (value) => {
        if (
          !value ||
          value === "0000-00-00" ||
          value.startsWith("0001-01-01")
        ) {
          return <span style={{color: "#aaa"}}>N/A</span>;
        }

        // For valid string
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          return value.slice(0, 10);
        }

        // For Date object or timestamp
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }

        return <span style={{color: "#aaa"}}>N/A</span>;
      },
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Parent PhoneNumber",
      dataIndex: "parentPhoneNumber",
      key: "parentPhoneNumber",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Parent Email",
      dataIndex: "parentEmailAddress",
      key: "parentEmailAddress",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (item) => (
        <>
          <Button
            color="#355383"
            variant="outlined"
            onClick={() => openEditModal(item.studentId)} // Fixed: Using studentId instead of itemId
            style={{marginRight: 8, color: "#355383"}}
          >
            Edit
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div>
        <AddStudent />
      </div>
      <Divider />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "left",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <h2 style={{margin: 0}}>Student List</h2>
      </div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <Input
          placeholder="Search by full name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{width: 220}}
          allowClear
          prefix={<SearchOutlined />}
        />
        <Button
          type="primary"
          style={{background: "#355383"}}
          onClick={handleSendCreateAccount}
          loading={creatingAccount}
          icon={creatingAccount ? <LoadingOutlined /> : null}
        >
          Create Account for Parent
        </Button>
        <Button
          icon={<Download color="#ffffff" style={{padding: 4}} />}
          onClick={handleDownloadExcel}
          style={{background: "#52c41a", color: "#fff"}}
        >
          Download
        </Button>
      </div>
      {error && (
        <Alert type="error" message={error} style={{marginBottom: 16}} />
      )}
      <Spin spinning={loading}>
        <Table
          dataSource={students}
          columns={columns}
          rowKey="studentId"
          pagination={false}
          locale={{
            emptyText: !loading && !error ? "No students found" : undefined,
          }}
        />
      </Spin>
      <div style={{marginTop: 16, textAlign: "right"}}>
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={totalCount}
          showSizeChanger={false}
          showQuickJumper
          onChange={(page) => setPageIndex(page)}
        />
      </div>
      <StudentModal
        open={editModalOpen}
        studentId={editItemId}
        onClose={closeEditModal}
        onSaved={fetchStudents}
      />
    </div>
  );
};

export default StudentList;
