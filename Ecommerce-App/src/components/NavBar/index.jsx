import { LogoutOutlined } from "@ant-design/icons";
import { Popover, Button, Avatar } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import "./navbar.css";

const Navbar = (props) => {
  const [accountVisible, setAccountVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const sellerId = localStorage.getItem("sellerId");
  const [sellerData, setSellerData] = useState({});
  const profilePage = props.profilePage;

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("sellerId");
    localStorage.removeItem("token");
    navigate("/seller/login");
  };
  const accountContent = (
    <div className="account-content">
      <Button type="link" onClick={handleSignOut}>
        <LogoutOutlined /> Sign out
      </Button>
    </div>
  );

  const profileContent = (
    <div className="seller-profile-content">
      <Avatar
        size={64}
        src={sellerData.image}
        crossOrigin="anonymous"
        onClick={() => navigate(`/seller/profile/${sellerId}`)}
        style={{ cursor: "pointer" }}
      />
      <div style={{ marginTop: "10px", fontSize: "18px" }}>
        {sellerData.name}
      </div>
      <div style={{ fontSize: "14px", color: "gray" }}>{sellerData.email}</div>
      <div style={{ fontSize: "14px", color: "gray" }}>{sellerData.phone}</div>
      {profilePage && (
        <>
          <button
            style={{
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              padding: "5px 10px",
              margin: "10px 0",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => handleEditAccount()}
          >
            Update Profile
          </button>
          <button
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => handleDeleteAccount()}
          >
            Remove Profile
          </button>
        </>
      )}
    </div>
  );

  const handleEditAccount = () => {
    setProfileVisible(false);
    props.onEditAccountClick();
  };

  const handleDeleteAccount = () => {
    setProfileVisible(false);
    props.onRemoveAccountClick();
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

  // console.log(sellerData);

  return (
    <div className="navbar-container">
      <div className="navbar-main">
        <h1 className="navbar-main-head">{props.heading}</h1>
      </div>
      <div className="navbar-main-1">
        <div className="navbar-item-1">
          <Popover
            content={profileContent}
            trigger="hover"
            visible={profileVisible}
            onVisibleChange={(visible) => setProfileVisible(visible)}
            className="popover"
          >
            <PersonIcon className="navbar-icon" />
            <p>Profile</p>
          </Popover>
        </div>
        <div className="navbar-item-1">
          <Popover
            content={accountContent}
            trigger="hover"
            visible={accountVisible}
            onVisibleChange={(visible) => setAccountVisible(visible)}
            className="popover"
          >
            <ManageAccountsIcon className="navbar-icon" />
            <p>Account</p>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
