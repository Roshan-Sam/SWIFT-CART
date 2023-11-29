import { useParams } from "react-router-dom";
import CustomerNavBar from "../../components/CustomerNavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { Divider, Modal, Form, Input, message, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./customerprofile.css";
import CustomerFooter from "../../components/CustomerFooter";

const CustomerProfile = () => {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [noOfOrders, setNoOfOrders] = useState(0);
  const [purchasedAmount, setPurchasedAmount] = useState(0);

  const getCustomerData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/customer/${id}`);
      if (response.status == 200) {
        setCustomerData(response.data);
        setEditedProfile(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getCustomerData();
    getProductsBought();
  }, []);

  const toggleModalVisibility = () => {
    form.setFieldsValue({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      addressType: customerData.address[0].addressType,
      houseName: customerData.address[0].houseName,
      street: customerData.address[0].street,
      city: customerData.address[0].city,
      state: customerData.address[0].state,
      pincode: customerData.address[0].pincode,
    });
    setIsModalVisible(!isModalVisible);
  };

  const handleOk = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/customer/${id}`,
        editedProfile
      );
      if (response.data.message == "Customer Updated") {
        message.success(response.data.message);
      }
      setIsModalVisible(false);
      setEditedProfile({});
      setCustomerData({});
      getCustomerData();
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemoveProfle = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/customer/${id}`
      );
      if (response.status == 201) {
        message.success(response.data.message);
        localStorage.removeItem("customerId");
        localStorage.removeItem("token");
        navigate("/customer/login");
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

  const firstName = customerData.name ? customerData.name.split(" ")[0] : "";
  const lastName = customerData.name ? customerData.name.split(" ")[1] : "";

  const getProductDetails = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/products/${productId}`
      );
      if (response.status === 201) {
        return response.data;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getProductsBought = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/order/?customerId=${id}`
      );
      setNoOfOrders(response.data.length);

      const orders = response.data;

      let totalPrice = 0;

      for (const order of orders) {
        for (const item of order.products) {
          const productDetails = await getProductDetails(item.productId);
          const productPrice = productDetails.price || 0;
          const totalProductPrice = productPrice * order.products[0].quantity;
          totalPrice += totalProductPrice;
        }
      }
      setPurchasedAmount(totalPrice);
    } catch (e) {
      console.log(e);
    }
  };

  console.log("customer data", customerData);
  console.log("edited profile", editedProfile);
  return (
    <>
      <CustomerNavBar
        heading="Profile"
        onEditAccountClick={toggleModalVisibility}
        onRemoveAccountClick={handleRemoveProfle}
        onProfileUpdate={() => onProfileUpdate}
        profilePage="true"
      />
      <div className="customer-profile-container">
        <div className="customer-profile-main-1">
          <div className="profile-main-1-1">
            <div className="profile-heading">
              <h1>My Profile</h1>
              <div className="profile-head-line"></div>
            </div>
            <div className="profile-page-image">
              <div className="profile-page-image-1">
                <img src={customerData.image} alt="" crossOrigin="" />
              </div>
              <div className="profile-page-image-2">
                <h3>
                  {customerData.name
                    ? customerData.name.charAt(0).toUpperCase() +
                      customerData.name.slice(1)
                    : ""}
                </h3>
              </div>
            </div>
            <div className="profile-page-personal-details">
              <h1>Personal Information</h1>
              <div className="informations">
                <div className="personal-details-1">
                  <div className="personal-details-1-1">
                    <h3>First Name: </h3>
                  </div>
                  <div className="personal-details-1-2">
                    <p>
                      {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
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
                        {lastName.charAt(0).toUpperCase() + lastName.slice(1)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="personal-details-1">
                  <div className="personal-details-1-1">
                    <h3>Email: </h3>
                  </div>
                  <div className="personal-details-1-2">
                    <p>{customerData.email}</p>
                  </div>
                </div>
                <div className="personal-details-1">
                  <div className="personal-details-1-1">
                    <h3>Phone: </h3>
                  </div>
                  <div className="personal-details-1-2">
                    <p>{customerData.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="personal-address">
              <h1>Address</h1>
              <div className="address-details">
                <div className="address-details-1">
                  <div className="address-details-1-1">
                    <h3>Address Type: </h3>
                  </div>
                  <div className="address-details-1-2">
                    {customerData.address ? (
                      <p>{customerData.address[0].addressType}</p>
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
                    {customerData.address ? (
                      <p>
                        {customerData.address[0].houseName
                          .charAt(0)
                          .toUpperCase() +
                          customerData.address[0].houseName.slice(1)}
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
                    {customerData.address ? (
                      <p>
                        {customerData.address[0].city.charAt(0).toUpperCase() +
                          customerData.address[0].city.slice(1)}
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
                    {customerData.address ? (
                      <p>
                        {customerData.address[0].state.charAt(0).toUpperCase() +
                          customerData.address[0].state.slice(1)}
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
                    {customerData.address ? (
                      <p>
                        {customerData.address[0].street
                          .charAt(0)
                          .toUpperCase() +
                          customerData.address[0].street.slice(1)}
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
                    {customerData.address ? (
                      <p>
                        {customerData.address[0].pincode
                          .charAt(0)
                          .toUpperCase() +
                          customerData.address[0].pincode.slice(1)}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="customer-profile-orders">
              <h1>Purchase Details</h1>
              <div className="customer-profile-orders-1">
                <div className="order-details-1">
                  <div className="customer-profile-orders-1-1">
                    <h3>Total no of Orders: </h3>
                  </div>
                  <div className="customer-profile-orders-1-2">
                    <p>{noOfOrders}</p>
                  </div>
                </div>
                <div className="order-details-1">
                  <div className="customer-profile-orders-1-1">
                    <h3>Total Purchase Amout: </h3>
                  </div>
                  <div className="customer-profile-orders-1-2">
                    <p>₹ {purchasedAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomerFooter />
      <Modal
        title="Edit Customer Details"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={toggleModalVisibility}
        className="customer-profile-modal"
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
          {customerData.address && customerData.address[0] ? (
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

export default CustomerProfile;
