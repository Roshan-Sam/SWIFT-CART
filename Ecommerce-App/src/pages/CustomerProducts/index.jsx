import { useState, useEffect, useRef } from "react";
import CustomerNavBar from "../../components/CustomerNavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Rate, Button, Spin, Select, message, Modal, Result } from "antd";
import CustomerFooter from "../../components/CustomerFooter";
import { motion, AnimatePresence } from "framer-motion";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../config";
import "./customerproducts.css";

const CustomerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 2;
  const { Meta } = Card;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Category");
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState("Sub Category");
  const [brandNames, setBrandNames] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("Brand");
  const navigate = useNavigate();
  const userId = localStorage.getItem("customerId");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [customerData, setCustomerData] = useState({});
  const [selectedRating, setSelectedRating] = useState("Rating");

  const fetchProducts = async () => {
    try {
      const priceRangeParam =
        selectedPriceRange !== "all" ? `&priceRange=${selectedPriceRange}` : "";
      const response = await axios.get(
        `http://localhost:8000/products/?page=${page}&limit=${limit}&search=${searchQuery}${priceRangeParam}&categoryId=${selectedCategory}&subCategoryId=${selectedSubCategory}&brand=${selectedBrand}&rating=${selectedRating}`
      );
      const newProducts = response.data.limitedProducts;
      setProducts(page === 1 ? newProducts : [...products, ...newProducts]);
      setBrandNames(response.data.brandNames);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    searchQuery,
    selectedPriceRange,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    selectedRating,
  ]);

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const onInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    setPage(1);
  };

  const priceRanges = [
    { label: "All", value: "all" },
    { label: "Below 1000", value: "0-1000" },
    { label: "1000-10000", value: "1000-10000" },
    { label: "10000-100000", value: "10000-100000" },
    { label: "Above 100000", value: "100000" },
  ];

  const onPriceRangeChange = (e) => {
    const value = e.target.value;
    setSelectedPriceRange(value);
    setPage(1);
  };

  useEffect(() => {
    getCategories();
    getSubCategories();
    getCustomerById();
  }, []);

  const getCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/category/`);
      const data = response.data;
      setCategoryData(data);
    } catch (e) {
      console.log("Error fetching categories", e);
    }
  };

  const handleCategoryChange = (value) => {
    if (value == "all") {
      setSelectedCategory("Category");
      setSelectedSubCategory("Sub Category");
      setPage(1);
    } else {
      setSelectedCategory(value);
      setSelectedSubCategory("Sub Category");
      setPage(1);
    }
  };

  const getSubCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/subcategory/`);
      const data = response.data;
      setSubCategoryData(data);
    } catch (e) {
      console.log("Error fetching sub categories", e);
    }
  };
  const handleSubCategoryChange = (value) => {
    if (value == "all") {
      setSelectedSubCategory("Sub Category");
      setSelectedCategory("Category");
      setSelectedBrand("Brand");
      setPage(1);
    } else {
      setSelectedSubCategory(value);
      setSelectedCategory("Category");
      setSelectedBrand("Brand");
      setPage(1);
    }
  };

  const handleBrandChange = (value) => {
    if (value == "all") {
      setSelectedBrand("Brand");
    } else {
      setSelectedBrand(value);
    }
    setPage(1);
  };

  const handlePreview = (id) => {
    navigate(`/customer/product-preview/${id}`);
  };

  const handleAddCart = async (id) => {
    if (!userId) {
      message.info("Please log in to add products to your cart.");
      return;
    } else {
      try {
        const response = await axios.post("http://localhost:8000/cart/", {
          customerId: userId,
          productId: id,
          quantity: 1,
        });
        const data = response.data;
        if (response.data && response.data.products) {
          const data = response.data;
          const total = data.products.reduce(
            (acc, product) => acc + product.quantity,
            0
          );
          setTotalQuantity(total);
          localStorage.setItem("cartTotal", total);
        } else {
          console.log("No products in the cart.");
          setTotalQuantity(0);
        }
        message.success(`Product has been added to cart.`);
      } catch (e) {
        console.log("Error adding product to cart", e);
      }
    }
  };

  const handleBuyNow = async (
    productId,
    sellerid,
    productName,
    productPrice
  ) => {
    if (!userId) {
      message.info("Please log in to buy products.");
      return;
    } else {
      const stripe = await loadStripe(config.REACT_APP_STRIPE_PUBLISHABLE_KEY);

      const body = {
        products: [
          {
            productDetails: {
              name: productName,
              price: productPrice,
            },
            quantity: 1,
          },
        ],
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        "http://localhost:8000/api/create-checkout-session",
        body,
        {
          headers: headers,
        }
      );

      const session = res.data;

      const result = stripe.redirectToCheckout({
        sessionId: session.id,
      });
      if (session) {
        const customerId = userId;
        const sellerId = sellerid;
        const products = [
          {
            productId: productId,
            quantity: 1,
          },
        ];
        const address = customerData.address[0];
        const response = await axios.post(`http://localhost:8000/order/`, {
          customerId: customerId,
          sellerId: sellerId,
          products: products,
          shippingAddress: address,
        });
      }
    }
  };

  const getCustomerById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/customer/${userId}`
      );
      setCustomerData(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleRating = (value) => {
    if (value == "all") {
      setSelectedRating("Rating");
    } else {
      setSelectedRating(value);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("Category");
    setSelectedSubCategory("Sub Category");
    setSelectedBrand("Brand");
    setSelectedRating("Rating");
    setSelectedPriceRange("all");
    setPage(1);
  };

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  console.log(selectedRating);
  return (
    <>
      <CustomerNavBar pageName="productsPage" />
      <div className="customer-products-container">
        {loading ? (
          <Spin style={{ marginTop: "300px" }} />
        ) : (
          <div className="customer-products-main">
            <div className="customer-products-main-1">
              <input
                value={searchQuery}
                type="text"
                placeholder="search producs.."
                onChange={onInputChange}
                className="products-page-input"
              />
            </div>
            <div className="customer-products-main-2">
              <div className="customer-products-main-2-0"></div>
              <div className="customer-products-main-2-0-1">
                <div className="customer-products-main-2-0-1-1">
                  <div className="customer-products-main-2-1">
                    <Select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="custom-select"
                      bordered={false}
                      onMouseEnter={() => setCategoryOpen(true)}
                      onMouseLeave={() => setCategoryOpen(false)}
                      open={categoryOpen}
                    >
                      <Select.Option key="all" value="all">
                        All
                      </Select.Option>
                      {categoryData.map((category) => (
                        <Select.Option key={category._id} value={category._id}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="customer-products-main-2-2">
                    <Select
                      className="custom-select"
                      value={selectedSubCategory}
                      onChange={handleSubCategoryChange}
                      bordered={false}
                      onMouseEnter={() => setSubCategoryOpen(true)}
                      onMouseLeave={() => {
                        setSubCategoryOpen(false);
                      }}
                      open={subCategoryOpen}
                    >
                      <Select.Option key="all" value="all">
                        All
                      </Select.Option>
                      {subCategoryData.map((subcategory) => (
                        <Select.Option
                          key={subcategory._id}
                          value={subcategory._id}
                        >
                          {subcategory.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {brandNames && (
                    <div className="customer-products-main-2-4">
                      <Select
                        className="custom-select"
                        value={selectedBrand}
                        onChange={handleBrandChange}
                        bordered={false}
                        onMouseEnter={() => setBrandOpen(true)}
                        onMouseLeave={() => setBrandOpen(false)}
                        open={brandOpen}
                      >
                        <Select.Option key="all" value="all">
                          All
                        </Select.Option>
                        {brandNames.map((brand) => (
                          <Select.Option key={brand} value={brand}>
                            {brand}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
                <div className="customer-products-main-2-0-1-2">
                  <div className="customer-products-main-2-5">
                    <Select
                      className="custom-select"
                      value={selectedRating}
                      onChange={(value) => handleRating(value)}
                      bordered={false}
                      onMouseEnter={() => setRatingOpen(true)}
                      onMouseLeave={() => setRatingOpen(false)}
                      open={ratingOpen}
                    >
                      <Select.Option value={"all"}>All</Select.Option>
                      <Select.Option value={1}>1</Select.Option>
                      <Select.Option value={2}>2</Select.Option>
                      <Select.Option value={3}>3</Select.Option>
                      <Select.Option value={4}>4</Select.Option>
                      <Select.Option value={5}>5</Select.Option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="customer-products-main-3">
              <div className="products-main-3-1">
                <span>Price</span>
                <div className="price-line"></div>
                <div className="price-buttons">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() =>
                        onPriceRangeChange({ target: { value: range.value } })
                      }
                      className={`products-page-button ${
                        selectedPriceRange === range.value ? "selected" : ""
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <h3
                  className="products-page-clear-filter"
                  onClick={clearFilters}
                >
                  <ClearAllIcon /> filters
                </h3>
              </div>
              <AnimatePresence>
                <motion.div layout className="products-main-3-2">
                  {products.map((product, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        className="main-3-products-listing-card"
                        hoverable={false}
                        key={product._id}
                        cover={
                          <motion.img
                            src={product.images[0]}
                            crossOrigin="anonymous"
                            onClick={() => handlePreview(product._id)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          />
                        }
                      >
                        <Meta
                          title={product.name}
                          description={`Price: ₹ ${product.price}`}
                        />
                        {product.ratings.length > 0 ? (
                          <Rate
                            allowHalf
                            value={
                              product.ratings
                                .map((rating) => rating.rating)
                                .reduce((a, b) => a + b) /
                              product.ratings.length
                            }
                            className="main-3-rate"
                          />
                        ) : (
                          <Rate allowHalf value={0} className="rate" />
                        )}
                        <div className="products-main-3-2-buttons">
                          <Button
                            type="dashed"
                            block
                            onClick={() => handleAddCart(product._id)}
                          >
                            Add to Cart
                          </Button>
                          <Button
                            type="primary"
                            block
                            onClick={() =>
                              handleBuyNow(
                                product._id,
                                product.sellerId,
                                product.name,
                                product.price
                              )
                            }
                          >
                            Buy Now
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="customer-product-main-4">
              <i
                onClick={handleLoadMore}
                class="fa fa-chevron-circle-down customer-products-down-arr"
                aria-hidden="true"
              ></i>
            </div>
          </div>
        )}
      </div>
      <CustomerFooter />
    </>
  );
};

export default CustomerProducts;
