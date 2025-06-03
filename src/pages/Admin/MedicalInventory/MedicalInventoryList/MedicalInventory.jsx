import React, {useState, useEffect, useCallback} from "react";
import {Table, Input, Pagination, Spin, Alert, Button} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";

const pageSize = 10;

const MedicalInventory = () => {
   const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                PageIndex: pageIndex,
                PageSize: pageSize,
            };
            const response = await axiosInstance.get("/api/medical-inventories", {params});
            console.log("Fetched medical inventory:", response.data.items);
            setData(response.data.items || []);
            setTotalCount(response.data.count || 0);
        } catch (err) {
            setError(err.response?.data || err.message || "Error fetching medical inventory");
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [pageIndex]);

    useEffect(() => {
        fetchData();
    }, [pageIndex, fetchData]);

    const filterInventory = data.filter((item) =>
    item.itemName?.toLowerCase().includes(searchText.toLowerCase())
  );

     const columns = [
    {title: "Item Name", dataIndex: "itemName", key: "itemName"},
    {title: "Category", dataIndex: "category", key: "category"},
    {title: "Description", dataIndex: "description", key: "description"},
    {title: "Unit Of Measure", dataIndex: "unitOfMeasure", key: "unitOfMeasure"},
    { title: "Expiry Date", 
      dataIndex: "expiryDate", 
      key: "expiryDate", 
      render: (value) => value ? value.toString().slice(0, 10) : ""},
    {title: "Maximum Stock Level", 
      dataIndex: "maximumStockLevel", 
      key: "maximumStockLevel", sorter: (a, b) => a.maximumStockLevel - b.maximumStockLevel},
    {title: "Minimum Stock Level", 
      dataIndex: "minimumStockLevel", 
      key: "minimumStockLevel", sorter: (a, b) => a.minimumStockLevel - b.minimumStockLevel},
    {title: "Quantity Stock", 
      dataIndex: "quantityInStock", 
      key: "quantityInStock", sorter: (a, b) => a.quantityInStock - b.quantityInStock},
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const value = status ? 1 : 0;
        return (
          <span style={{ color: value === 1 ? "green" : "orange" }}>
            {value}
          </span>
        );
      },
    },
  ];
  
  return <div>
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
        </div>
        {error && (
          <Alert type="error" message={error} style={{marginBottom: 16}} />
        )}
        <Spin spinning={loading}>
          <Table
            dataSource={filterInventory}
            columns={columns}
            rowKey="itemName"
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
      </div>;
};

export default MedicalInventory;
