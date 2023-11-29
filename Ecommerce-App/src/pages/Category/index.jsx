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
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import axios from "axios";
import "./category.css";

const Category = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [data, setData] = useState([]);
  const [form] = useForm();
  const [editForm] = useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/category/");
      const categories = response.data;
      const data = categories.map((item, index) => ({
        _id: item._id,
        id: index + 1,
        name: item.name,
        image: item.image,
      }));
      setData(data);
    } catch (e) {
      console.log("Error getting categories data", e);
    }
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Category added successfully",
      duration: 3,
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Category ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category Image",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <img
          src={text}
          className="category-img"
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
            title="Are you sure you want to delete this category?"
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
      await axios.delete(`http://localhost:8000/category/${id}`);
      getCategory();
      message.success(`Category has been deleted.`);
    } catch (e) {
      console.log(e);
    }
  };

  const addCategory = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/category/",
        categoryData
      );
      form.resetFields();
      setCategoryData({});
      success();
      getCategory();
      console.log("Category added Successfully", response.data);
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
      setCategoryData({
        ...categoryData,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({
      ...categoryData,
      [name]: value,
    });
  };

  const handleEdit = (record) => {
    editForm.setFieldsValue({
      name: record.name,
    });
    setEditCategoryData({
      _id: record._id,
      name: record.name,
      image: record.image,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    editForm.resetFields();
    setIsEditModalVisible(false);
    setEditCategoryData({});
  };

  const onEditInputChange = (e) => {
    setEditCategoryData({ ...editCategoryData, name: e.target.value });
  };

  const onEditFileChange = (e) => {
    const fileList = e.fileList;
    if (fileList.length > 0) {
      handleEditImageUpload(fileList[0].originFileObj);
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
      setEditCategoryData({
        ...editCategoryData,
        image: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };
  const editCategory = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/category/${editCategoryData._id}`,
        editCategoryData
      );
      editForm.resetFields();
      setEditCategoryData({});
      message.success(`Category updated successfully`);
      getCategory();
      setIsEditModalVisible(false);
      console.log("Category updated Successfully", response.data);
    } catch (e) {
      console.log(e);
    }
  };

  // console.log(editCategoryData);
  // console.log(data);
  return (
    <div className="category-container">
      {contextHolder}
      <SideBar />
      <div className="category-main">
        <Navbar heading="Category" />
        <div className="category-main-sub">
          <div className="category-main-1">
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Add Category
            </Button>
          </div>
          <div className="category-main-table">
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
        title="Add Category"
        visible={isModalVisible}
        onOk={form.submit}
        onCancel={handleCancel}
        okText="Submit"
        cancelText="Cancel"
        className="category-modal"
      >
        <div className="category-modal-content">
          <Form
            form={form}
            name="categoryForm"
            onFinish={addCategory}
            className="category-modal-form"
          >
            <Form.Item
              name="name"
              label="Category Name"
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
              label="Category Image"
              valuePropName="fileList"
              getValueFromEvent={onFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="Edit Category"
        visible={isEditModalVisible}
        onOk={editCategory}
        onCancel={handleEditModalCancel}
        okText="Submit"
        cancelText="Cancel"
        className="category-modal"
      >
        <div className="category-modal-content">
          <Form
            form={editForm}
            name="editCategoryForm"
            className="category-modal-form"
          >
            <Form.Item name="name" label="Category Name">
              <Input name="name" onChange={onEditInputChange} />
            </Form.Item>
            <Form.Item
              name="image"
              label="Category Image"
              valuePropName="fileList"
              getValueFromEvent={onEditFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Category;
