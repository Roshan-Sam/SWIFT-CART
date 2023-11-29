import CustomerNavBar from "../../components/CustomerNavBar";
import axios from "axios";
import { Card, Rate, Button, message } from "antd";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../config";
import AOS from "aos";
import "aos/dist/aos.css";
import CustomerFooter from "../../components/CustomerFooter";
import { motion, AnimatePresence } from "framer-motion";
import "./customerhome.css";

const CustomerHome = () => {
  const [cartData, setCartData] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [products, setProducts] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [heading, setHeading] = useState("New Arrivals");
  const userId = localStorage.getItem("customerId");
  const { Meta } = Card;
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const main2HeadingRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    "http://localhost:8000/uploads/1700982202999-slider_1.jpg",
    "http://localhost:8000/uploads/1700982283334-pexels-cottonbro-studio-3944405.jpg",
    "http://localhost:8000/uploads/1700982335680-pexels-pixabay-276528.jpg",
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToMain2Heading = () => {
    if (main2HeadingRef.current) {
      main2HeadingRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const onCategoryProductsFetch = (productHeading) => {
    setHeading(
      productHeading.charAt(0).toUpperCase() + productHeading.slice(1)
    );
    setCategoryProducts([]);
  };

  const getproducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products/");
      const productsData = response.data.products;
      const sortedProducts = productsData.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      setProducts(sortedProducts);
    } catch (e) {
      console.log("Error getting products", e);
    }
  };
  useEffect(() => {
    getproducts();
    getCustomerById();
    AOS.init({
      offset: 100,
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

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
        setCartData(data);
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

  const displayProducts = categoryProducts.length
    ? categoryProducts.slice(0, 8)
    : products.slice(0, 8);

  useEffect(() => {
    getCategories();
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

  const getCategoryproducts = async (categoryId, categoryName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/products/?categoryId=${categoryId}`
      );
      const data = response.data.categoryProducts;
      setCategoryProducts(data);
      const name = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      setHeading(name);
    } catch (e) {
      console.log(e);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setSlide((slide + 1) % slides.length);
  };

  const previousSlide = () => {
    setDirection(-1);
    setSlide((slide - 1 + slides.length) % slides.length);
  };

  const variants = {
    initial: (direction) => {
      return {
        x: direction > 0 ? 1 : -1,
        opacity: 0,
      };
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => {
      return {
        x: direction > 0 ? -1 : 1,
        opacity: 0,
      };
    },
  };

  // console.log(categoryProducts);
  // console.log(products);
  // console.log("display", displayProducts);
  // console.log(cartData);
  // console.log("customer data", customerData);
  return (
    <>
      <CustomerNavBar
        onCategoryProductsFetch={onCategoryProductsFetch}
        scrollToTop={scrollToTop}
      />
      <div className="customer-home-container">
        <div className="customer-home-main">
          <div className="main-1">
            <div className="main-1-1">
              <div className="main-1-carousal">
                <div className="carousal-image">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      variants={variants}
                      animate="animate"
                      initial="initial"
                      exit="exit"
                      src={slides[slide]}
                      className="d-block w-100 carousal-img"
                      crossOrigin="anonymous"
                      key={slides[slide]}
                      custom={direction}
                      data-aos="zoom-in"
                    />
                  </AnimatePresence>
                </div>
                <i
                  class="fa fa-angle-left carousal-left-arrow"
                  aria-hidden="true"
                  onClick={previousSlide}
                ></i>
                <i
                  class="fa fa-angle-right carousal-right-arrow"
                  aria-hidden="true"
                  onClick={nextSlide}
                ></i>
              </div>
            </div>
          </div>
          <div className="main-banner">
            <div className="banner-container">
              {categoryData.map((item) => (
                <div className="banner">
                  <img
                    src={item.image}
                    alt="Banner 1"
                    className="banner-image"
                    crossOrigin="anonymous"
                  />
                  <button
                    type="primary"
                    className="banner-button"
                    onClick={() => {
                      getCategoryproducts(item._id, item.name);
                      scrollToMain2Heading();
                    }}
                  >
                    {item.name.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="main-2">
            <div className="main-2-heading" ref={main2HeadingRef}>
              <h1>{heading}</h1>
            </div>
            <div className="main-2-products-listing">
              {displayProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="main-2-products-listing-card"
                  data-aos="zoom-in"
                >
                  <img src={product.images[0]} crossOrigin="anonymous" />

                  <div className="main-2-product-listing-content">
                    <h3>{product.name}</h3>
                    <p>{`₹ ${product.price}`}</p>

                    {product.ratings.length > 0 ? (
                      <Rate
                        allowHalf
                        value={
                          product.ratings
                            .map((rating) => rating.rating)
                            .reduce((a, b) => a + b) / product.ratings.length
                        }
                        className="rate"
                      />
                    ) : (
                      <Rate allowHalf value={0} className="rate" />
                    )}
                    <div className="product-button">
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
                  </div>
                  <div className="quick-view-button">
                    <Button
                      type="primary"
                      onClick={() => handlePreview(product._id)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="main-3">
            <Button
              type="link"
              className="main-3-btn"
              onClick={() => navigate("/customer/products")}
            >
              See more varieties of products{" "}
              <span className="long-arrow"></span>
            </Button>
          </div>
        </div>
      </div>
      <CustomerFooter />
    </>
  );
};

export default CustomerHome;
