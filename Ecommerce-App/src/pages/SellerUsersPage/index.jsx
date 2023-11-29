import Navbar from "../../components/NavBar";
import SideBar from "../../components/SideBar";
import { Table } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import "./sellerusers.css";

const SellerUsers = () => {
  const [users, setUsers] = useState([]);
  const id = localStorage.getItem("sellerId");
  console.log(id);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/order/", {
        params: { sellerId: id, customerPopulate: true },
      });

      const uniqueCustomers = {};

      response.data.forEach((order) => {
        const customerId = order.customerId._id;

        if (!uniqueCustomers[customerId]) {
          uniqueCustomers[customerId] = order.customerId;
        }
      });
      const uniqueCustomersArray = Object.values(uniqueCustomers);

      setUsers(uniqueCustomersArray);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={image}
          alt="customer"
          style={{ width: 50, height: 50, borderRadius: 50 }}
          crossOrigin=""
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <span>
          {address
            ? `${address[0].houseName}, ${address[0].street}, ${address[0].city}, ${address[0].state}`
            : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="seller-user-container">
      <SideBar />
      <div className="seller-user-main">
        <Navbar heading="Users" />
        <div className="seller-user-main-1">
          <Table
            dataSource={users}
            columns={columns}
            scroll={{ x: true, y: 400 }}
            rowClassName="custom-table-row"
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerUsers;
