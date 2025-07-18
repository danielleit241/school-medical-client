import {useState, useEffect, useCallback} from "react";
import {Table, Input, Pagination, Spin, Alert, Button} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import VaccineModal from "./VaccineModal";
import Swal from "sweetalert2";
import {Download, Plus} from "lucide-react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
const pageSize = 10;

const VaccineInventory = () => {
  const navigate = useNavigate();
  const role = useSelector((state) => state.user?.role);
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        Search: searchText,
      };
      const response = await axiosInstance.get("/api/vaccination-details", {
        params,
      });
      setData(response.data.items || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data ||
          err.message ||
          "Error fetching vaccination details"
      );
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, searchText]);

  useEffect(() => {
    fetchData();
  }, [pageIndex, fetchData, searchText]);

  const openEditModal = (vaccineId) => {
    setEditItemId(vaccineId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditItemId(null);
    setEditModalOpen(false);
  };

  const openCreateModal = () => {
    setEditItemId(null);
    setEditModalOpen(true);
  };

  const handleDownload = async () => {
    if (data.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No items to download",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    try {
      const res = await axiosInstance.get("/api/vaccines/export-excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vaccines.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
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
      console.error("Download error:", error);
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

  const handleDelete = async (vaccineId) => {
    try {
      const res = await axiosInstance.delete(
        `/api/vaccination-details/${vaccineId}`
      );
      console.log("Delete response:", res.data);
      await Swal.fire({
        icon: "success",
        title: "Deleted successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  const showDeleteConfirm = (itemId) => {
    Swal.fire({
      title: "Do you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(itemId);
      }
    });
  };
  const filterInventory = data
  .filter((item) => item.status === true) // chỉ lấy status true
  .filter((item) =>
    item.vaccineName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddVaccineList = () => {
    navigate(`/${role}/vaccine/create`);
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
      title: "Vaccine Code",
      dataIndex: "vaccineCode",
      key: "vaccineCode",
      width: 40,
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Vaccine Name",
      dataIndex: "vaccineName",
      key: "vaccineName",
      width: 150,
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Vaccine Type",
      dataIndex: "vaccineType",
      key: "vaccineType",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Age ",
      dataIndex: "ageRecommendation",
      key: "ageRecommendation",
      width: 80,
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Batch Number",
      dataIndex: "batchNumber",
      key: "batchNumber",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Expiration Date",
      dataIndex: "expirationDate",
      key: "expirationDate",
      width: 120,
      render: (value) =>
        value ? (
          value.toString().slice(0, 10)
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
    },
    {
      title: "Contraindication Notes",
      dataIndex: "contraindicationNotes",
      key: "contraindicationNotes",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (item) => (
        <div style={{display: "flex", justifyContent: "center", gap: 8}}>
          <Button
            color="#355383"
            variant="outlined"
            onClick={() => openEditModal(item.vaccineId)}
            style={{marginRight: 8, color: "#355383"}}
          >
            Edit
          </Button>
          <Button danger onClick={() => showDeleteConfirm(item.vaccineId)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "left",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <h2 style={{margin: 0}}>Vaccines Inventory List</h2>
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
          placeholder="Search by vaccine name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{width: 220}}
          allowClear
          prefix={<SearchOutlined />}
        />
        <Button
          icon={<Plus color="black" style={{display: "flex", padding: 4}} />}
          onClick={handleAddVaccineList}
          style={{background: "#fff", color: "black"}}
        >
          Add Vaccine List
        </Button>
        <Button
          icon={
            <Download color="#ffffff" style={{display: "flex", padding: 4}} />
          }
          onClick={handleDownload}
          style={{background: "#52c41a", color: "#fff"}}
        >
          Download
        </Button>
        <Button
          type="primary"
          style={{background: "#355383"}}
          onClick={openCreateModal}
        >
          Add New
        </Button>
      </div>
      {error && (
        <Alert type="error" message={error} style={{marginBottom: 16}} />
      )}
      <Spin spinning={loading}>
        <Table
          dataSource={filterInventory}
          columns={columns}
          rowKey="vaccineName"
          pagination={false}
          locale={{
            emptyText: !loading && !error ? "No items found" : undefined,
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
      <VaccineModal
        open={editModalOpen}
        vaccineId={editItemId}
        onClose={closeEditModal}
        onSaved={fetchData}
      />
    </div>
  );
};

export default VaccineInventory;
