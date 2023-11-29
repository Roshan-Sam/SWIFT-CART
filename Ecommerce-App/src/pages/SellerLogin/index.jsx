import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, Button, Alert } from "antd";
import { NavLink } from "react-router-dom";
import "./sellerlogin.css";

const SellerLogin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginSeller = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/seller/login",
        data
      );
      const sellerId = response.data.sellerId;
      const token = response.data.token;
      localStorage.setItem("sellerId", sellerId);
      localStorage.setItem("token", token);
      console.log(response);
      setLoading(false);
      navigate("/seller/dashboard");
    } catch (e) {
      setError("Email or Password is Incorrect");
      setTimeout(() => {
        setError(null);
        setLoading(false);
      }, 3000);
    }
  };

  const onChange = (e, key) => {
    setData({ ...data, [key]: e.target.value });
  };
  const onFinish = () => {
    loginSeller();
  };
  return (
    <div className="seller-container">
      <div className="seller-login">
        {error && <Alert message={error} type="error" showIcon />}
        <h1>
          SWIFT<span className="login-span">CART</span>
        </h1>
        <div className="form">
          <Form
            className="seller-login-form"
            name="seller-login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
                {
                  required: true,
                  message: "Email is required",
                },
              ]}
            >
              <Input
                onChange={(e) => {
                  onChange(e, "email");
                }}
                size="large"
                placeholder="Email"
                className="email-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters long",
                },
              ]}
            >
              <Input.Password
                onChange={(e) => {
                  onChange(e, "password");
                }}
                size="large"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="login-btn"
                loading={loading}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
          <div className="seller-sign">
            <p>
              Not a memeber?<NavLink to="/seller/signup">SignUp</NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
