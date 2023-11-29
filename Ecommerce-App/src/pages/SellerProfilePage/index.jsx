import { useParams } from "react-router-dom";
import SideBar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Typography,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./sellerprofile.css";

const SellerProfile = () => {
  const { id } = useParams();
  const [sellerData, setSellerData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getSellerData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/seller/${id}`);
      if (response.status == 200) {
        setSellerData(response.data);
        setEditedProfile(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getSellerData();
  }, []);

  const toggleModalVisibility = () => {
    form.setFieldsValue({
      name: sellerData.name,
      email: sellerData.email,
      phone: sellerData.phone,
      addressType: sellerData.address[0].addressType,
      houseName: sellerData.address[0].houseName,
      street: sellerData.address[0].street,
      city: sellerData.address[0].city,
      state: sellerData.address[0].state,
      pincode: sellerData.address[0].pincode,
    });
    setIsModalVisible(!isModalVisible);
  };

  const handleOk = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/seller/${id}`,
        editedProfile
      );
      if (response.data.message == "Seller Updated") {
        message.success(response.data.message);
      }
      setIsModalVisible(false);
      setEditedProfile({});
      setSellerData({});
      getSellerData();
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemoveProfle = async () => {
    try {
      const response = await axios.delete(`http://localhost:8000/seller/${id}`);
      if (response.status == 201) {
        message.success(response.data.message);
        localStorage.removeItem("sellerId");
        localStorage.removeItem("token");
        navigate("/seller/login");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onFileChange = (e) => {
    const fileList = e.fileList;
    if (fileList.length > 0) {
      handleImageUpload(fileList[0].originFileObj);
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
      setEditedProfile({
        ...editedProfile,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };

  const firstName = sellerData.name ? sellerData.name.split(" ")[0] : "";
  const lastName = sellerData.name ? sellerData.name.split(" ")[1] : "";

  console.log("edited profile", editedProfile);
  return (
    <>
      <div className="seller-profile-container">
        <SideBar />
        <div className="seller-profile-main">
          <Navbar
            heading="Profile"
            onEditAccountClick={toggleModalVisibility}
            onRemoveAccountClick={handleRemoveProfle}
            profilePage="profilePage"
          />
          <div className="customer-profile-container">
            <div className="customer-profile-main-1">
              <div className="profile-main-1-1">
                <div className="profile-heading">
                  <h1>My Profile</h1>
                </div>
                <div
                  className="profile-page-image"
                  style={{ border: "2px solid white" }}
                >
                  <div className="profile-page-image-1">
                    <img src={sellerData.image} alt="" crossOrigin="" />
                  </div>
                  <div className="profile-page-image-2">
                    <h3>
                      {sellerData.name
                        ? sellerData.name.charAt(0).toUpperCase() +
                          sellerData.name.slice(1)
                        : ""}
                    </h3>
                  </div>
                </div>
                <div
                  className="profile-page-personal-details"
                  style={{ border: "2px solid white" }}
                >
                  <h1>Personal Information</h1>
                  <div className="informations">
                    <div className="personal-details-1">
                      <div className="personal-details-1-1">
                        <h3>First Name: </h3>
                      </div>
                      <div className="personal-details-1-2">
                        <p>
                          {firstName.charAt(0).toUpperCase() +
                            firstName.slice(1)}
                        </p>
                      </div>
                    </div>
                    {lastName && (
                      <div className="personal-details-1">
                        <div className="personal-details-1-1">
                          <h3>Last Name: </h3>
                        </div>
                        <div className="personal-details-1-2">
                          <p>
                            {lastName.charAt(0).toUpperCase() +
                              lastName.slice(1)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="personal-details-1">
                      <div className="personal-details-1-1">
                        <h3>Email: </h3>
                      </div>
                      <div className="personal-details-1-2">
                        <p>{sellerData.email}</p>
                      </div>
                    </div>
                    <div className="personal-details-1">
                      <div className="personal-details-1-1">
                        <h3>Phone: </h3>
                      </div>
                      <div className="personal-details-1-2">
                        <p>{sellerData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="personal-address"
                  style={{ border: "2px solid white" }}
                >
                  <h1>Address</h1>
                  <div className="address-details">
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>Address Type: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>{sellerData.address[0].addressType}</p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>House Name: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>
                            {sellerData.address[0].houseName
                              .charAt(0)
                              .toUpperCase() +
                              sellerData.address[0].houseName.slice(1)}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>City: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>
                            {sellerData.address[0].city
                              .charAt(0)
                              .toUpperCase() +
                              sellerData.address[0].city.slice(1)}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>State: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>
                            {sellerData.address[0].state
                              .charAt(0)
                              .toUpperCase() +
                              sellerData.address[0].state.slice(1)}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>Street: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>
                            {sellerData.address[0].street
                              .charAt(0)
                              .toUpperCase() +
                              sellerData.address[0].street.slice(1)}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="address-details-1">
                      <div className="address-details-1-1">
                        <h3>Pincode: </h3>
                      </div>
                      <div className="address-details-1-2">
                        {sellerData.address ? (
                          <p>
                            {sellerData.address[0].pincode
                              .charAt(0)
                              .toUpperCase() +
                              sellerData.address[0].pincode.slice(1)}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Edit Seller Details"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={toggleModalVisibility}
        className="profile-modal"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input
              value={editedProfile.name}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              value={editedProfile.email}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, email: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input
              value={editedProfile.phone}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, phone: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            name="image"
            label="Profile Image"
            valuePropName="fileList"
            getValueFromEvent={onFileChange}
          >
            <Upload name="image" action="/your-upload-url">
              <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
            </Upload>
          </Form.Item>
          <Divider>Address</Divider>
          {sellerData.address && sellerData.address[0] ? (
            <>
              <Form.Item name="addressType" label="Address Type">
                <Input
                  value={editedProfile.address[0].addressType}
                  placeholder="Work, Home or Other"
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          addressType: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="houseName" label="House Name">
                <Input
                  value={editedProfile.address[0].houseName}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          houseName: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="street" label="Street">
                <Input
                  value={editedProfile.address[0].street}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          street: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="city" label="City">
                <Input
                  value={editedProfile.address[0].city}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          city: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="state" label="State">
                <Input
                  value={editedProfile.address[0].state}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          state: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="pincode" label="Pincode">
                <Input
                  value={editedProfile.address[0].pincode}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: [
                        {
                          ...editedProfile.address[0],
                          pincode: e.target.value,
                        },
                      ],
                    })
                  }
                />
              </Form.Item>
            </>
          ) : (
            <p>No address details</p>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default SellerProfile;
