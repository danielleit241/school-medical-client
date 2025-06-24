import React, {useState, useEffect, useCallback} from "react";
import {Table, Input, Pagination, Spin, Alert, Button} from "antd";
import {SearchOutlined, DownloadOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import "./index.scss";
import Swal from "sweetalert2";
import MedicalInventoryModal from "./MedicalInventoryModal";
import {Download} from "lucide-react";

const pageSize = 10;

const MedicalInventory = () => {
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
      const response = await axiosInstance.get("/api/medical-inventories", {
        params,
      });
      console.log("Fetched medical inventory:", response.data.items);
      setData(response.data.items || []);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data || err.message || "Error fetching medical inventory"
      );
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, searchText]);

  useEffect(() => {
    fetchData();
  }, [pageIndex, fetchData]);

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
      const res = await axiosInstance.get(
        "/api/medical-inventories/export-excel",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "medical_inventory.xlsx");
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
      console.error("Error downloading data:", error);
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

  const handleDelete = async (itemId) => {
    try {
      const res = await axiosInstance.delete(
        `/api/medical-inventories/${itemId}`
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
      fetchData(); // reload lại danh sách
    } catch (err) {
      console.error("Error deleting item:", err);
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

  const openEditModal = (itemId) => {
    setEditItemId(itemId);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditItemId(null);
  };

  const openCreateModal = () => {
    setEditItemId(null);
    setEditModalOpen(true);
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
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Unit Of Measure",
      dataIndex: "unitOfMeasure",
      key: "unitOfMeasure",
      render: (text) =>
        text ? <span>{text}</span> : <span style={{color: "#aaa"}}>N/A</span>,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (value) =>
        value ? (
          value.toString().slice(0, 10)
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
    },
    {
      title: "Last Import Date",
      dataIndex: "lastImportDate",
      key: "lastImportDate",
      render: (value) =>
        value ? (
          value.toString().slice(0, 10)
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
      align: "center",
    },
    {
      title: "Last Export Date",
      dataIndex: "lastExportDate",
      key: "lastExportDate",
      render: (value) =>
        value ? (
          value.toString().slice(0, 10)
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
      align: "center",
    },
    {
      title: "Maximum Stock Level",
      dataIndex: "maximumStockLevel",
      key: "maximumStockLevel",
      align: "center",
      render: (value) =>
        value !== null && value !== undefined ? (
          value
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
    },
    {
      title: "Minimum Stock Level",
      dataIndex: "minimumStockLevel",
      key: "minimumStockLevel",
      align: "center",
      render: (value) =>
        value !== null && value !== undefined ? (
          value
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
    },
    {
      title: "Quantity Stock",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      align: "center",
      render: (value) =>
        value !== null && value !== undefined ? (
          value
        ) : (
          <span style={{color: "#aaa"}}>N/A</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === null || status === undefined) {
          return <span style={{color: "#aaa"}}>N/A</span>;
        }
        const value = status ? 1 : 0;
        return (
          <span style={{color: value === 1 ? "green" : "orange"}}>{value}</span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (item) => (
        <>
          <div style={{display: "flex", justifyContent: "center", gap: 8}}>
            <Button
              color="#355383"
              variant="outlined"
              onClick={() => openEditModal(item.itemId)}
              style={{marginRight: 8, color: "#355383"}}
            >
              Edit
            </Button>
            <Button danger onClick={() => showDeleteConfirm(item.itemId)}>
              Delete
            </Button>
          </div>
        </>
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
        <h2 style={{margin: 0}}>Medical Inventory List</h2>
        <span style={{color: "#d46b08", fontWeight: 500, fontSize: 15}}>
          Note: Items with <b>Quantity Stock</b> euqual <b>Minimum Stock</b>{" "}
          will be displayed
        </span>
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
          placeholder="Search by item name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{width: 220}}
          allowClear
          prefix={<SearchOutlined />}
        />
        <Button
          icon={<Download color="#ffffff" style={{padding: 4}} />}
          onClick={handleDownload}
          style={{background: "#52c41a", color: "#fff"}}
        >
          Download
        </Button>
        <Button
          type="primary"
          style={{background: "#1677ff", color: "#fff"}}
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
          dataSource={data}
          columns={columns}
          rowKey="itemName"
          pagination={false}
          locale={{
            emptyText: !loading && !error ? "No items found" : undefined,
          }}
          rowClassName={(record) =>
            record.quantityInStock === record.minimumStockLevel
              ? "low-quantity-row"
              : ""
          }
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
      <MedicalInventoryModal
        open={editModalOpen}
        itemId={editItemId}
        onClose={closeEditModal}
        onSaved={fetchData}
      />
    </div>
  );
};

export default MedicalInventory;
