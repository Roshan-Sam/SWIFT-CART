import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import SideBar from "../../components/SideBar";
import axios from "axios";
import { Table, Button, Space, Popconfirm } from "antd";
import "./sellerorder.css";

const SellerOrder = () => {
  const [sellerOrder, setSellerOrder] = useState([]);
  const id = localStorage.getItem("sellerId");
  const [data, setData] = useState([]);
  const [customerNamesFetched, setCustomerNamesFetched] = useState(false);

  const getCustomerNameandProductName = async () => {
    try {
      const updatedOrders = await Promise.all(
        sellerOrder.map(async (item, index) => {
          const response = await axios.get(
            `http://localhost:8000/customer/${item.customerId}`
          );
          const customerName = response.data.name;

          const res = await axios.get(
            `http://localhost:8000/products/${item.products[0].productId}`
          );
          const productName = res.data.name;
          return {
            ...item,
            index: index + 1,
            customerName: customerName,
            productName: productName,
          };
        })
      );
      setSellerOrder(updatedOrders);
      setCustomerNamesFetched(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (sellerOrder.length > 0 && !customerNamesFetched) {
      getCustomerNameandProductName();
    }
  }, [sellerOrder, customerNamesFetched]);

  const getSellerOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8000/order/", {
        params: { sellerId: id },
      });
      if (response.status == 201) {
        setSellerOrder(response.data);
        setCustomerNamesFetched(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getSellerOrders();
  }, []);

  const columns = [
    {
      title: "Order Id",
      dataIndex: "index",
      key: "orderIndex",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => record.products[0].quantity,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const paginationConfig = {
    pageSize: 4,
    showSizeChanger: false,
    style: {
      display: "flex",
      justifyContent: "center",
    },
  };

  console.log(sellerOrder);
  return (
    <div className="seller-order-container">
      <SideBar />
      <div className="seller-order-main">
        <Navbar heading="Orders" />
        <div className="seller-order-main-1">
          <Table
            dataSource={sellerOrder}
            columns={columns}
            pagination={paginationConfig}
            scroll={{ x: true }}
            rowClassName="custom-table-row"
          />
        </div>
      </div>
    </div>
  );
};

export default SellerOrder;
