import SideBar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Select,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import axios from "axios";
import "./subcategory.css";

const Subcategory = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSubcategoryData, setEditedSubcategoryData] = useState({});
  const [subcategoryData, setSubCategoryData] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [data, setData] = useState([]);
  const [form] = useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { Option } = Select;
  const [editForm] = useForm();

  useEffect(() => {
    getSubCategory();
    getCategory();
  }, []);

  const getSubCategory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/subcategory/");
      const subcategories = response.data;
      const data = subcategories.map((item, index) => ({
        _id: item._id,
        id: index + 1,
        name: item.name,
        image: item.image,
        categoryId: item.categoryId,
      }));
      setData(data);
    } catch (e) {
      console.log("Error getting categories data", e);
    }
  };
  const getCategory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/category/");
      const categories = response.data;
      setCategoryData(categories);
    } catch (e) {
      console.log("Error getting categories data", e);
    }
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Sub Category added successfully",
      duration: 3,
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.setFieldsValue({
      category: "Select Category",
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Sub Category ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Sub Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Sub Category Image",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <img
          src={text}
          crossOrigin="anonymous"
          style={{ width: "50px", height: "50px" }}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Popconfirm
            title="Are you sure you want to delete this sub category?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
          <a
            className="ant-btn ant-btn-link"
            onClick={() => handleEdit(record)}
            style={{ textDecoration: "none" }}
          >
            Edit
          </a>
        </div>
      ),
    },
  ];
  const paginationConfig = {
    pageSize: 2,
    showSizeChanger: false,
    style: {
      display: "flex",
      justifyContent: "center",
    },
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/subcategory/${id}`);
      getSubCategory();
      message.success(`Sub Category has been deleted.`);
    } catch (e) {
      console.log(e);
    }
  };

  const addSubCategory = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/subcategory/",
        subcategoryData
      );
      form.resetFields();
      setIsModalVisible(false);
      setSubCategoryData({});
      success();
      getSubCategory();
      console.log("Sub Category added Successfully", response.data);
    } catch (e) {}
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
      setSubCategoryData({
        ...subcategoryData,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryData({
      ...subcategoryData,
      [name]: value,
    });
  };

  const onCategoryChange = (value) => {
    const selectedCategory = categoryData.find((item) => item.name === value);
    if (selectedCategory) {
      setSubCategoryData({
        ...subcategoryData,
        categoryId: selectedCategory._id,
      });
    }
  };

  const handleEdit = (record) => {
    const name = categoryData.find((item) => item._id == record.categoryId);
    editForm.setFieldsValue({
      name: record.name,
      category: name.name,
    });
    setEditedSubcategoryData({
      _id: record._id,
      name: record.name,
      categoryId: record.categoryId,
      categoryName: name.name,
    });
    setEditModalVisible(true);
  };

  const onEditCategoryChange = (value) => {
    const selectedCategory = categoryData.find((item) => item.name == value);
    if (selectedCategory) {
      setEditedSubcategoryData({
        ...editedSubcategoryData,
        categoryId: selectedCategory._id,
      });
    }
  };
  const handleEditSubmit = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/subcategory/${editedSubcategoryData._id}`,
        {
          name: editedSubcategoryData.name,
          image: editedSubcategoryData.image,
          categoryId: editedSubcategoryData.categoryId,
        }
      );
      if (response.data == "Subcategory Updated") {
        message.success("Subcategory updated");
      }
      setEditModalVisible(false);
      setEditedSubcategoryData({});
      editForm.resetFields();
      getSubCategory();
    } catch (e) {
      console.log(e);
    }
  };

  const handleEditImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      );
      const imageURL = response.data.imageURL;
      setEditedSubcategoryData({
        ...editedSubcategoryData,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };
  const onEditFileChange = (e) => {
    const fileList = e.fileList;
    if (fileList.length > 0) {
      handleEditImageUpload(fileList[0].originFileObj);
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    editForm.resetFields();
    setEditedSubcategoryData({});
  };

  // console.log(subcategoryData);
  // console.log(editedSubcategoryData);
  // console.log(data);
  // console.log(categoryData);

  return (
    <div className="subcategory-container">
      {contextHolder}
      <SideBar />
      <div className="subcategory-main">
        <Navbar heading="Sub Category" />
        <div className="subcategory-main-sub">
          <div className="subcategory-main-1">
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Add Sub Category
            </Button>
          </div>
          <div className="subcategory-main-table">
            <Table
              dataSource={data}
              columns={columns}
              pagination={paginationConfig}
              scroll={{ x: true }}
              rowClassName="custom-table-row"
            />
          </div>
        </div>
      </div>
      <Modal
        title="Add Sub Category"
        visible={isModalVisible}
        onOk={form.submit}
        onCancel={handleCancel}
        okText="Submit"
        cancelText="Cancel"
        className="subcategory-modal"
      >
        <div className="subcategory-modal-content">
          <Form
            form={form}
            name="subcategoryForm"
            onFinish={addSubCategory}
            className="subcategory-modal-form"
          >
            <Form.Item
              name="name"
              label="Sub Category Name"
              rules={[
                {
                  required: true,
                  message: "Please enter the category name!",
                },
              ]}
            >
              <Input name="name" onChange={onInputChange} />
            </Form.Item>
            <Form.Item
              name="image"
              label="Sub Category Image"
              valuePropName="fileList"
              getValueFromEvent={onFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="category"
              label="Select Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category!",
                },
              ]}
            >
              <Select onChange={onCategoryChange}>
                {categoryData.map((category) => (
                  <Option key={category._id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="Edit Sub Category"
        visible={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText="Submit"
        cancelText="Cancel"
        className="subcategory-modal"
      >
        <div className="subcategory-modal-content">
          <Form
            name="editSubcategoryForm"
            className="subcategory-modal-form"
            form={editForm}
          >
            <Form.Item
              name="name"
              label="Sub Category Name"
              rules={[
                {
                  required: true,
                  message: "Please enter the category name!",
                },
              ]}
            >
              <Input
                name="name"
                onChange={(e) =>
                  setEditedSubcategoryData({
                    ...editedSubcategoryData,
                    name: e.target.value,
                  })
                }
              />
            </Form.Item>
            <Form.Item
              name="image"
              label="Sub Category Image"
              valuePropName="fileList"
              getValueFromEvent={onEditFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="category"
              label="Select Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category!",
                },
              ]}
            >
              <Select onChange={onEditCategoryChange}>
                {categoryData.map((category) => (
                  <Option key={category._id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Subcategory;
