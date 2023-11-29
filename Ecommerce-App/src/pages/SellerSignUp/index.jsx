import { Input, Form, Select, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sellersignup.css";

const SellerSignUp = () => {
  const navigate = useNavigate();
  const { Option } = Select;
  const [sellerData, setSellerData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    password: "",
    address: {
      addressType: "",
      houseName: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const onSellerSignUp = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/seller/sign-up",
        sellerData
      );
      console.log("Seller signup successfully:", response.data);
      navigate("/seller/login");
      setSellerData({});
    } catch (e) {
      console.log("Error signing up seller:", e);
    }
  };
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="91">+91</Option>
        <Option value="1">+1</Option>
      </Select>
    </Form.Item>
  );
  const validatePhoneNumber = (rule, value, callback) => {
    if (value && value.replace(/[^0-9]/g, "").length !== 10) {
      callback("Please enter a valid 10-digit phone number");
    } else {
      callback();
    }
  };
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      );
      const imageURL = response.data.imageURL;
      setSellerData({
        ...sellerData,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };
  const onFileChange = (e) => {
    const fileList = e.fileList;
    if (fileList.length > 0) {
      handleImageUpload(fileList[0].originFileObj);
    }
  };
  const onFinish = () => {
    onSellerSignUp();
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setSellerData({
        ...sellerData,
        address: {
          ...sellerData.address,
          [addressField]: value,
        },
      });
    } else {
      setSellerData({ ...sellerData, [name]: value });
    }
  };
  const handleAddressTypeChange = (value) => {
    setSellerData({
      ...sellerData,
      address: {
        ...sellerData.address,
        addressType: value,
      },
    });
  };
  console.log(sellerData);
  return (
    <div className="seller-signup-container">
      <div className="form">
        <div className="sign-up-head">
          <h1>
            SWIFT<span className="sign-up-span">CART</span>
          </h1>
        </div>
        <div className="sign-up-form">
          <Form
            name="sellerSignupForm"
            className="seller-form"
            initialValues={{
              prefix: "91",
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter your full name",
                },
              ]}
            >
              <Input name="name" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input name="email" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  validator: validatePhoneNumber,
                },
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                style={{ width: "100%" }}
                name="phone"
                onChange={handleInputChange}
              />
            </Form.Item>
            <Form.Item
              label="Profile Picture"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={onFileChange}
            >
              <Upload
                name="profilePicture"
                listType="picture"
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password name="password" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The new password that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                name="confirmPassword"
                onChange={handleInputChange}
              />
            </Form.Item>
            <Form.Item
              label="Address Type"
              name="address.addressType"
              rules={[
                {
                  required: true,
                  message: "Please select an address type",
                },
              ]}
            >
              <Select
                name="address.addressType"
                onChange={(value) => handleAddressTypeChange(value)}
              >
                <Option value="home">Home</Option>
                <Option value="work">Work</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="House Name"
              name="houseName"
              rules={[
                {
                  required: true,
                  message: "Please enter a house name",
                },
              ]}
            >
              <Input name="address.houseName" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              label="Street"
              name="street"
              rules={[
                {
                  required: true,
                  message: "Please enter a street name",
                },
              ]}
            >
              <Input name="address.street" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              label="City"
              name="city"
              rules={[
                {
                  required: true,
                  message: "Please enter a city",
                },
              ]}
            >
              <Input name="address.city" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              label="State"
              name="state"
              rules={[
                {
                  required: true,
                  message: "Please enter a state",
                },
              ]}
            >
              <Input name="address.state" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item
              label="Pincode"
              name="pincode"
              rules={[
                {
                  required: true,
                  message: "Please enter a pincode",
                },
              ]}
            >
              <Input name="address.pincode" onChange={handleInputChange} />
            </Form.Item>
            <Form.Item className="seller-sign-btn">
              <Button type="primary" htmlType="submit">
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SellerSignUp;
