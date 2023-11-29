import { useParams } from "react-router-dom";
import axios from "axios";
import CustomerNavBar from "../../components/CustomerNavBar";
import { useEffect, useState } from "react";
import { Rate, message, List, Typography, Form, Input, Button } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../config";
import "./productpreview.css";

const ProductPreview = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([{}]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [cartData, setCartData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const userId = localStorage.getItem("customerId");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  const success = () => {
    messageApi.open({
      type: "success",
      content: "",
      duration: 3,
    });
  };

  const getCustomerName = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/customer/${customerId}`
      );
      setCustomerData(response.data);
      return response.data.name;
    } catch (e) {
      console.log(e);
    }
  };
  const getProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`);
      const productData = response.data;
      const avgRating = productData.ratings.map((rating) => rating.rating);
      const averageRating =
        avgRating.length > 0
          ? avgRating.reduce((a, b) => a + b) / avgRating.length
          : 0;
      const image = productData.images[0];
      const ratings = await Promise.all(
        productData.ratings.map(async (rating) => {
          const customerName = await getCustomerName(rating.customerId);
          return {
            ...rating,
            customerName,
          };
        })
      );
      setProduct({
        ...productData,
        averageRating: averageRating,
        image: image,
        ratings: ratings,
      });
    } catch (e) {
      console.log(`Error getting product from id :${id}`, e);
    }
  };
  useEffect(() => {
    getProduct();
  }, []);

  const handleAddCart = async () => {
    if (!userId) {
      message.info("Please log in to add products to cart.");
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

  const handleSubmitReview = async () => {
    if (!userId) {
      message.info("Please log in to proceed.");
      return;
    } else {
      try {
        const currentDate = new Date();
        const response = await axios.put(
          `http://localhost:8000/products/${product._id}`,
          {
            ratings: {
              customerId: userId,
              rating: rating,
              review: review,
              date: currentDate,
            },
          }
        );
        getProduct();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!userId) {
      message.info("Please log in to buy products.");
      return;
    } else {
      const stripe = await loadStripe(config.REACT_APP_STRIPE_PUBLISHABLE_KEY);

      const body = {
        products: [
          {
            productDetails: {
              name: product.name,
              price: product.price,
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
        const sellerId = product.sellerId;
        const products = [
          {
            productId: id,
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

  // console.log(product);
  // console.log(cartData);
  // console.log(totalQuantity);
  // console.log(rating);
  // console.log(review);
  console.log(customerData);
  return (
    <>
      <CustomerNavBar />
      <div className="product-preview-container">
        <div className="product-preview-main">
          <div className="product-preview-main-1">
            <div className="product-preview-main-1-1">
              <img
                src={product.image}
                className="product-image"
                crossOrigin="anonymous"
                alt={product.name}
              />
            </div>
            <div className="product-preview-main-1-2">
              <h1 className="product-name">{product.name}</h1>
              <div className="product-rating">
                <Rate allowHalf disabled value={product.averageRating} />
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <p>Price: ₹ {product.price}</p>
                <p>Discount: {product.discount}%</p>
                <p>Brand: {product.brand}</p>
                <p>Available Variants:</p>
                <ul className="product-variants">
                  {product.variants && product.variants.length > 0 ? (
                    product.variants.map((variant, index) => (
                      <li key={index}>{variant}</li>
                    ))
                  ) : (
                    <li>No variants available</li>
                  )}
                </ul>
                <p>Tags:</p>
                <ul className="product-tags">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag, index) => <li key={index}>{tag}</li>)
                  ) : (
                    <li>No tags available</li>
                  )}
                </ul>
                <p>Quantity: {product.quantity}</p>
              </div>
              <div className="button-container">
                {product.isAvailable ? (
                  <>
                    <button className="buy-now-button" onClick={handleBuyNow}>
                      Buy Now
                    </button>
                    <button
                      className="add-to-cart-button"
                      onClick={handleAddCart}
                    >
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <p>Out of Stock</p>
                )}
              </div>
            </div>
          </div>
          <div className="product-preview-main-2">
            <div className="product-preview-main-2-1">
              <h2>Reviews</h2>
            </div>
            <div className="product-preview-main-2-2">
              {product.ratings && product.ratings.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={product.ratings}
                  renderItem={(rating, index) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Typography.Text strong>
                            {rating.customerName}
                          </Typography.Text>
                        }
                        description={rating.review}
                      />
                      <Rate allowHalf disabled value={rating.rating} />
                    </List.Item>
                  )}
                />
              ) : (
                <p>No reviews available</p>
              )}
            </div>
            <div className="product-preview-main-2-3">
              <h2>Add a Review</h2>
              <Form onFinish={handleSubmitReview} layout="vertical">
                <Form.Item label="Rating" name="rating" initialValue={rating}>
                  <Rate allowHalf onChange={setRating} />
                </Form.Item>
                <Form.Item label="Review" name="review" initialValue={review}>
                  <Input.TextArea
                    rows={4}
                    onChange={(e) => setReview(e.target.value)}
                    style={{ borderRadius: "2px" }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ borderRadius: "2px" }}
                  >
                    Submit Review
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPreview;
