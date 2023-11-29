import { NavLink } from "react-router-dom";
import { Badge, Avatar, Popover } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import "./customernavbar.css";

const CustomerNavBar = ({
  onCategoryProductsFetch,
  onEditAccountClick,
  onRemoveAccountClick,
  onProfileUpdate,
  scrollToTop,
  profilePage,
}) => {
  const [profileVisible, setProfileVisible] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [cartData, setCartData] = useState({});
  const navigate = useNavigate();
  const cartTotal = localStorage.getItem("cartTotal");
  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("customerId");
  const profileName = profilePage;

  const profileContent = (
    <div className="customer-profile-content">
      <Avatar
        size={64}
        src={customerData.image}
        crossOrigin="anonymous"
        onClick={() => navigate(`/customer/profile/${customerId}`)}
        style={{ cursor: "pointer" }}
      />
      <div style={{ marginTop: "10px" }}>
        {customerData.name ? (
          <h3>
            {customerData.name.charAt(0).toUpperCase() +
              customerData.name.slice(1)}
          </h3>
        ) : (
          ""
        )}
      </div>
      <div style={{ marginTop: "5px" }}>
        {customerData.email ? <h4>{customerData.email}</h4> : ""}
      </div>
      <div style={{ marginTop: "5px" }}>
        {customerData.phone ? <h4>{customerData.phone}</h4> : ""}
      </div>
      {profileName && (
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
              borderRadius: "1px",
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
              borderRadius: "1px",
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
    onEditAccountClick();
  };

  const handleDeleteAccount = () => {
    setProfileVisible(false);
    onRemoveAccountClick();
  };

  const handleLogin = () => {
    navigate("/customer/login");
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("cartTotal");
    navigate("/customer/login");
  };

  const getCustomer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/customer/${customerId}`
      );
      const data = response.data;
      setCustomerData(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (token) {
      getCustomer();
    }
  }, [onProfileUpdate]);

  const getCustomerCart = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/cart/?customerId=${customerId}`
      );
      const data = response.data;
      setCartData(data);
      const total = data.products.reduce(
        (acc, product) => acc + product.quantity,
        0
      );
      localStorage.setItem("cartTotal", total);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCustomerCart();
  }, [customerId]);

  const onInitialState = () => {
    onCategoryProductsFetch("New Arrivals");
  };

  // console.log(customerData);
  // console.log(cartData);
  return (
    <div className="customer-navbar-container">
      <div className="left-section">
        <div className="ecommerce-heading" onClick={onInitialState}>
          <span className="span-1">
            SWIFT<span className="span-2">CART</span>
          </span>
        </div>
      </div>

      <div className="middle-section">
        <div className="nav-items">
          <h3 onClick={() => scrollToTop()}>
            <NavLink className="nav-items-1" to="/customer/">
              HOME
            </NavLink>
          </h3>
          <h3>
            <NavLink className="nav-items-1" to="/customer/products">
              SHOP
            </NavLink>
          </h3>
          <h3>
            <NavLink className="nav-items-1" to="/customer/about">
              ABOUT
            </NavLink>
          </h3>
        </div>
      </div>

      <div className="right-section">
        {customerId ? (
          <Badge
            count={cartTotal}
            overflowCount={10}
            style={{ backgroundColor: "red" }}
          >
            <img
              className="cart-icon"
              src="/shopping-bag.svg"
              onClick={() => navigate("/customer/cart")}
            />
          </Badge>
        ) : (
          <Badge
            count={0}
            overflowCount={10}
            style={{ backgroundColor: "red" }}
          >
            <img
              className="cart-icon"
              src="/shopping-bag.svg"
              onClick={() => navigate("/customer/cart")}
            />
          </Badge>
        )}
        {token ? (
          <Popover
            content={profileContent}
            trigger="hover"
            visible={profileVisible}
            onVisibleChange={(visible) => setProfileVisible(visible)}
          >
            <i
              className="fa fa-user navbar-profile-icon"
              aria-hidden="true"
              onClick={() => navigate(`/customer/profile/${customerId}`)}
            ></i>
          </Popover>
        ) : (
          <i className="fa fa-user navbar-profile-icon" aria-hidden="true"></i>
        )}
        {token ? (
          <button className="login-button" onClick={handleLogout}>
            <LogoutIcon className="login-icon" />
            <span className="login-span">Sign Out</span>
          </button>
        ) : (
          <button className="login-button" onClick={handleLogin}>
            <LoginIcon className="login-icon" />
            <span className="login-span">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerNavBar;
