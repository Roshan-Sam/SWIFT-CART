import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomerNavBar from "../../components/CustomerNavBar";
import { Button, message } from "antd";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../config";
import "./cart.css";

const Cart = () => {
  const [cartData, setCartData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [flag, setFlag] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const customerId = localStorage.getItem("customerId");

  const getCartData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/cart/?customerId=${customerId}`
      );
      const data = response.data;
      setCartData(data);
      setFlag(true);
      if (response.data && response.data.products) {
        const data = response.data;
        const total = data.products.reduce(
          (acc, product) => acc + product.quantity,
          0
        );
        localStorage.setItem("cartTotal", total);
      } else {
        console.log("No products in the cart.");
      }
    } catch (e) {
      console.log("Error fetching cart products", e);
    }
  };

  const getCartProducts = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/products/${productId}`
      );
      return response.data;
    } catch (e) {
      console.log("Error fetching product details", e);
      return null;
    }
  };

  const getCustomerData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/customer/${customerId}`
      );
      setCustomerData(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCartData();
    getCustomerData();
  }, []);

  useEffect(() => {
    if (cartData && cartData.products && cartData.products.length > 0) {
      const fetchProductDetailsPromises = cartData.products.map((product) =>
        getCartProducts(product.productId)
      );
      Promise.all(fetchProductDetailsPromises)
        .then((productDetails) => {
          const updatedCartData = {
            ...cartData,
            products: cartData.products.map((product, index) => ({
              ...product,
              productDetails: productDetails[index],
            })),
          };
          if (flag) {
            setCartData(updatedCartData);
            setFlag(false);
          }
        })
        .catch((e) => {
          console.error("Error fetching product details:", e);
        });
    }
  }, [cartData]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.put("http://localhost:8000/cart/", {
        customerId: customerId,
        productId: productId,
        quantity: newQuantity,
      });

      if (response.data.message === "Cart Updated") {
        const updatedCartData = {
          ...cartData,
          products: cartData.products.map((product) =>
            product.productId === productId
              ? { ...product, quantity: newQuantity }
              : product
          ),
        };
        setCartData(updatedCartData);

        const totalPrice = updatedCartData.products.reduce((acc, product) => {
          if (product.productDetails) {
            return acc + product.quantity * product.productDetails.price;
          } else {
            return acc;
          }
        }, 0);
        setSubtotal(totalPrice);

        const total = updatedCartData.products.reduce(
          (acc, product) => acc + product.quantity,
          0
        );
        localStorage.setItem("cartTotal", total);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const response = await axios.delete("http://localhost:8000/cart", {
        data: {
          customerId: customerId,
          productId: productId,
        },
      });

      if (response.data.message === "Product removed from the cart") {
        getCartData();
        message.success("Porduct removed from cart");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (cartData && cartData.products && Array.isArray(cartData.products)) {
      const totalPrice = cartData.products.reduce((acc, product) => {
        if (product.productDetails) {
          return acc + product.quantity * product.productDetails.price;
        } else {
          return acc;
        }
      }, 0);
      setSubtotal(totalPrice);
    }
  }, [cartData]);

  const handleCheckOut = async () => {
    try {
      const stripe = await loadStripe(config.REACT_APP_STRIPE_PUBLISHABLE_KEY);

      const body = {
        products: cartData.products,
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
        for (const cartProduct of cartData.products) {
          const userId = customerId;
          const sellerId = cartProduct.productDetails.sellerId;
          const products = [
            {
              productId: cartProduct.productId,
              quantity: cartProduct.quantity,
            },
          ];
          const address = customerData.address[0];
          const response = await axios.post(`http://localhost:8000/order/`, {
            customerId: userId,
            sellerId: sellerId,
            products: products,
            shippingAddress: address,
          });
        }

        setFlag(true);
        setCartData({});
        const total = 0;
        localStorage.setItem("cartTotal", total);
        setSubtotal(0);
        await axios.delete(`http://localhost:8000/cart/${cartData._id}`);
      }
    } catch (error) {
      console.log("Error placing order:", error);
    }
  };

  console.log("cart data", cartData);
  // console.log("customer data", customerData);
  // console.log(subtotal);
  return (
    <>
      <CustomerNavBar />
      <div className="cart-container">
        <div className="cart-main">
          <table className="cart-table">
            {!flag && (
              <thead>
                <tr>
                  <th className="cart-table-header">Products</th>
                  <th className="cart-table-header">Title</th>
                  <th className="cart-table-header">Price</th>
                  <th className="cart-table-header">Quantity</th>
                  <th className="cart-table-header">Total</th>
                  <th className="cart-table-header">Remove</th>
                </tr>
              </thead>
            )}
            {!flag ? (
              <tbody>
                {cartData.products.map((product) => (
                  <tr key={product.productId} className="cart-table-row">
                    <td className="cart-table-data">
                      <img
                        src={product.productDetails.images[0]}
                        alt="Product"
                        crossOrigin="anonymous"
                        className="cart-product-image"
                      />
                    </td>
                    <td className="cart-table-data">
                      {product.productDetails.name}
                    </td>
                    <td className="cart-table-data">
                      ₹{product.productDetails.price.toFixed(2)}
                    </td>
                    <td className="cart-table-data cart-quantity-button">
                      <button
                        onClick={() =>
                          product.quantity > 1 &&
                          updateQuantity(
                            product.productId,
                            product.quantity - 1
                          )
                        }
                        className="quantity-button"
                      >
                        -
                      </button>
                      {product.quantity}
                      <button
                        onClick={() =>
                          updateQuantity(
                            product.productId,
                            product.quantity + 1
                          )
                        }
                        className="quantity-button"
                      >
                        +
                      </button>
                    </td>
                    <td className="cart-table-data">
                      ₹
                      {(
                        product.quantity * product.productDetails.price
                      ).toFixed(2)}
                    </td>
                    <td className="cart-table-data">
                      <Button
                        type="danger"
                        className="remove-button"
                        onClick={() => handleRemove(product.productId)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tr>
                <td colSpan="6">No products added in cart</td>
              </tr>
            )}
          </table>
          {cartData && cartData.products && cartData.products.length > 0 && (
            <div className="cart-main-1">
              <div className="cart-main-1-head">
                <h3>Cart Totals</h3>
              </div>
              <div className="cart-main-1-content">
                <p>Subtotal</p>
                <p>₹{subtotal}</p>
              </div>
              <div className="cart-main-1-content">
                <p>Shiping Fee</p>
                <p>Free</p>
              </div>
              <div className="cart-main-1-content">
                <p>Total</p>
                <p>
                  <b>₹{subtotal}</b>
                </p>
              </div>
              <div className="cart-main-1-content-1">
                <Button
                  type="primary"
                  className="checkout-button"
                  onClick={handleCheckOut}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
