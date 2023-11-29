import SideBar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
  Popconfirm,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import "./sellerinventory.css";

const SellerInventory = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const sellerId = localStorage.getItem("sellerId");
  const [sellerProducts, setSellerProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [form] = Form.useForm();
  const [modalMode, setModalMode] = useState("Add");
  const modalTitle = modalMode === "Add" ? "Add Product" : "Edit Product";
  const [editingProductId, setEditingProductId] = useState("");

  const [formDatas, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    brand: "",
    discount: 0,
    thumbnailImage: "",
    images: [],
    variants: [],
    categoryId: "",
    subCategoryId: "",
    isAvailable: true,
    quantity: 0,
    tags: [],
    sellerId: sellerId,
  });

  const columns = [
    {
      title: "Products ID",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "Image",
      dataIndex: "images",
      render: (images) => (
        <img
          src={images[0]}
          alt="Product"
          style={{ width: "50px" }}
          crossOrigin="anonymous"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => <span>₹ {price.toFixed(2)}</span>,
    },
    {
      title: "Average Rating",
      dataIndex: "ratings",
      render: (ratings) => {
        if (ratings.length > 0) {
          const totalRating = ratings.reduce(
            (sum, rating) => sum + rating.rating,
            0
          );
          const averageRating = totalRating / ratings.length;
          return averageRating.toFixed(1);
        } else {
          return "N/A";
        }
      },
    },
    {
      title: "Brand",
      dataIndex: "brand",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
          <a
            className="ant-btn ant-btn-link"
            onClick={() => handleEdit(record._id)}
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

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFormData({ sellerId: sellerId });
  };

  useEffect(() => {
    getSellerProducts();
    getCategoryData();
    getSubCategoryData();
  }, []);
  const getCategoryData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/category/`);
      const data = response.data;
      setCategoryData(data);
    } catch (e) {
      console.log("Error getting categories", e);
    }
  };
  const getSubCategoryData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/subcategory/`);
      const data = response.data;
      setSubCategoryData(data);
    } catch (e) {
      console.log("Error getting subcategoires", e);
    }
  };
  const getSellerProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/products/?sellerId=${sellerId}`
      );
      const data = response.data.sellerProducts;
      const datas = data.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
      setSellerProducts(datas);
    } catch (e) {
      console.log("Error fetching products", e);
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
      setFormData({
        ...formDatas,
        thumbnailImage: imageURL,
      });
    } catch (e) {
      console.log("error uploading image", e);
    }
  };
  const onImagesFileChange = (e) => {
    const fileList = e.fileList;
    const imageList = fileList.map((file) => file.originFileObj);

    setProductImages(imageList);
    handleImagesUpload();
  };

  const handleImagesUpload = async () => {
    const imageUrls = [];

    for (const file of productImages) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(
          "http://localhost:8000/upload",
          formData
        );
        const imageURL = response.data.imageURL;
        imageUrls.push(imageURL);
      } catch (e) {
        console.log("error uploading image", e);
      }
    }
    setFormData({
      ...formDatas,
      images: imageUrls,
    });
  };

  const addProduct = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/products/",
        formDatas
      );
      console.log("Product added:", response.data);
      setIsModalVisible(false);
      form.resetFields();
      getSellerProducts();
      setProductImages([]);
      setFormData({ sellerId: sellerId });
    } catch (e) {
      console.log("Error adding product", e);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/products/${id}`
      );
      if (response.status == 201) {
        message.success(response.data.message);
      }
      getSellerProducts();
    } catch (e) {
      console.log("Unable to delete the product");
    }
  };

  const handleAdd = () => {
    setModalMode("Add");
    showModal();
  };

  const handleEdit = (id) => {
    setFormData({ sellerId: sellerId });
    const editindData = sellerProducts.find((item) => item._id == id);
    setEditingProductId(editindData._id);
    const categoryName = categoryData.find(
      (item) => item._id == editindData.categoryId
    );
    const subCategoryName = subCategoryData.find(
      (item) => item._id == editindData.subCategoryId
    );
    form.setFieldsValue({
      name: editindData.name,
      description: editindData.description,
      price: editindData.price,
      brand: editindData.brand,
      discount: editindData.discount,
      variants: editindData.variants.join(", "),
      isAvailable: editindData.isAvailable,
      category: categoryName.name,
      subcategory: subCategoryName.name,
      quantity: editindData.quantity,
      tags: editindData.tags.join(", "),
    });
    setModalMode("Edit");
    showModal();
  };

  const updateProduct = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/products/${editingProductId}`,
        formDatas
      );
      if (response.status == 201) {
        message.success(response.data.message);
      }
      setEditingProductId("");
      setIsModalVisible(false);
      setFormData({ sellerId: sellerId });
      form.resetFields();
      setProductImages([]);
      getSellerProducts();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div className="seller-inventory-container">
        <SideBar />
        <div className="seller-inventory-main">
          <Navbar heading="Products" />
          <div className="seller-inventory-main-sub">
            <div className="seller-inventory-main-sub-1">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add Product
              </Button>
            </div>
            <div className="seller-inventory-main-sub-2">
              <Table
                dataSource={sellerProducts}
                columns={columns}
                pagination={paginationConfig}
                scroll={{ x: true }}
                rowClassName="custom-table-row"
              />
            </div>
          </div>
        </div>
        <Modal
          title={modalTitle}
          visible={isModalVisible}
          onOk={form.submit}
          onCancel={handleCancel}
          destroyOnClose={true}
          className="inventory-model"
        >
          <Form
            form={form}
            name="productForm"
            onFinish={modalMode === "Add" ? addProduct : updateProduct}
            className="inventory-model-form"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the product name" },
              ]}
            >
              <Input
                value={formDatas.name}
                onChange={(e) =>
                  setFormData({ ...formDatas, name: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter the product description",
                },
              ]}
            >
              <Input.TextArea
                value={formDatas.description}
                onChange={(e) =>
                  setFormData({ ...formDatas, description: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price"
              rules={[
                { required: true, message: "Please enter the product price" },
              ]}
            >
              <Input
                type="number"
                value={formDatas.price}
                onChange={(e) =>
                  setFormData({ ...formDatas, price: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="brand"
              label="Brand"
              rules={[
                { required: true, message: "Please enter the product brand" },
              ]}
            >
              <Input
                value={formDatas.brand}
                onChange={(e) =>
                  setFormData({ ...formDatas, brand: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="discount"
              label="Discount"
              rules={[
                {
                  required: true,
                  message: "Please enter the product discount",
                },
              ]}
            >
              <Input
                type="number"
                value={formDatas.discount}
                onChange={(e) =>
                  setFormData({ ...formDatas, discount: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="image"
              label="Thumbnail Image"
              valuePropName="fileList"
              getValueFromEvent={onFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>
                  Upload Thumbnail Image
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="image"
              label="Images"
              valuePropName="fileList"
              getValueFromEvent={onImagesFileChange}
            >
              <Upload name="image" action="/your-upload-url">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="variants"
              label="Variants"
              rules={[
                {
                  required: true,
                  message: "Please enter product variants",
                },
              ]}
            >
              <Input
                value={formDatas.variants}
                onChange={(e) => {
                  const variants = e.target.value
                    .split(",")
                    .map((variant) => variant.trim());
                  setFormData({ ...formDatas, variants });
                }}
                placeholder="Enter variants separated by commas"
              />
            </Form.Item>
            <Form.Item
              name="isAvailable"
              label="Is Available"
              rules={[
                { required: true, message: "Please select availability" },
              ]}
            >
              <Select
                value={formDatas.isAvailable}
                onChange={(value) =>
                  setFormData({ ...formDatas, isAvailable: value })
                }
              >
                <Select.Option value={true}>true</Select.Option>
                <Select.Option value={false}>false</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category",
                },
              ]}
            >
              <Select
                value={formDatas.categoryId}
                onChange={(value) =>
                  setFormData({ ...formDatas, categoryId: value })
                }
              >
                {categoryData.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="subcategory"
              label="Subcategory"
              rules={[
                {
                  required: true,
                  message: "Please select a subcategory",
                },
              ]}
            >
              <Select
                value={formDatas.subCategoryId}
                onChange={(value) =>
                  setFormData({ ...formDatas, subCategoryId: value })
                }
              >
                {subCategoryData.map((subcategory) => (
                  <Select.Option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                {
                  required: true,
                  message: "Please enter the quantity",
                },
              ]}
            >
              <Input
                type="number"
                value={formDatas.quantity}
                onChange={(e) =>
                  setFormData({ ...formDatas, quantity: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="tags"
              label="Tags"
              rules={[
                {
                  required: true,
                  message: "Please enter product tags",
                },
              ]}
            >
              <Input
                value={formDatas.tags}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim());
                  setFormData({ ...formDatas, tags });
                }}
                placeholder="Enter tags separated by commas"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default SellerInventory;
