import { Avatar } from "antd";
import {
  AppstoreOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  OrderedListOutlined,
  UserOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./sidebar.css";

const SideBar = () => {
  const [sellerData, setSellerData] = useState({});
  const sellerId = localStorage.getItem("sellerId");

  const navigate = useNavigate();
  const onNavigate = (route) => {
    navigate(route);
  };

  const getSellerData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/seller/${sellerId}`
      );
      if (response.status == 200) {
        setSellerData(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getSellerData();
  }, []);
  return (
    <div className="side-bar">
      <div className="side-bar-1">
        <h1>Dashboard</h1>
      </div>
      <div className="side-bar-2">
        <div
          className="side-bar-2-1"
          onClick={() => navigate("/seller/dashboard")}
        >
          <DashboardOutlined className="side-bar-icon" />
          <h3>Dashboard</h3>
        </div>
        <div
          className="side-bar-2-1"
          onClick={() => onNavigate("/seller/inventory")}
        >
          <AppstoreOutlined className="side-bar-icon" />
          <h3>Inventory</h3>
        </div>
        <div
          className="side-bar-2-1"
          onClick={() => onNavigate("/seller/category")}
        >
          <AppstoreAddOutlined className="side-bar-icon" />
          <h3>Category</h3>
        </div>
        <div
          className="side-bar-2-1"
          onClick={() => onNavigate("/seller/subcategory")}
        >
          <TagsOutlined className="side-bar-icon" />
          <h3>Sub Category</h3>
        </div>
        <div
          className="side-bar-2-1"
          onClick={() => onNavigate("/seller/order")}
        >
          <OrderedListOutlined className="side-bar-icon" />
          <h3>Order</h3>
        </div>
      </div>
      <div className="side-bar-3">
        <div className="side-bar-3-1">
          <Avatar
            size={50}
            className="avatar"
            src={sellerData.image}
            crossOrigin="anonymous"
          />
          <div className="side-bar-3-1-1">
            <h4>{sellerData.name}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
