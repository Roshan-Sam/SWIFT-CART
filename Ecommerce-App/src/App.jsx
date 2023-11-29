import { Routes, Route } from "react-router-dom";
import SellerLogin from "./pages/SellerLogin";
import SellerDasdboard from "./pages/SellerDashboard";
import SellerSignUp from "./pages/SellerSignUp";
import Category from "./pages/Category";
import Subcategory from "./pages/SubCategory";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignUp from "./pages/CustomerSignUp";
import CustomerHome from "./pages/CustomerHome";
import ProductPreview from "./pages/ProductPreview";
import SellerInventory from "./pages/SellerInventory";
import SellerProfile from "./pages/SellerProfilePage";
import Cart from "./pages/Cart";
import CustomerProfile from "./pages/CustomerProfile";
import SellerOrder from "./pages/SellerOrder";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomerProducts from "./pages/CustomerProducts";
import PaymentSuccess from "./pages/PaymentSuccess";
import SellerUsers from "./pages/SellerUsersPage";
import "./App.css";

function App() {
  const Token = ({ children }) => {
    const token = localStorage.getItem("token");
    if (token) {
      return <>{children}</>;
    } else {
      return <Navigate to="/seller/login" />;
    }
  };
  return (
    <>
      <Routes>
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/signup" element={<SellerSignUp />} />
        <Route
          path="/seller/dashboard"
          element={
            <Token>
              <SellerDasdboard />
            </Token>
          }
        />
        <Route
          path="/seller/category"
          element={
            <Token>
              <Category />
            </Token>
          }
        />
        <Route
          path="/seller/subcategory"
          element={
            <Token>
              <Subcategory />
            </Token>
          }
        />
        <Route
          path="/seller/inventory"
          element={
            <Token>
              <SellerInventory />
            </Token>
          }
        />
        <Route
          path="/seller/profile/:id"
          element={
            <Token>
              <SellerProfile />
            </Token>
          }
        />
        <Route
          path="/seller/order"
          element={
            <Token>
              <SellerOrder />
            </Token>
          }
        />
        <Route
          path="/seller/users"
          element={
            <Token>
              <SellerUsers />
            </Token>
          }
        />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignUp />} />
        <Route path="/customer/" element={<CustomerHome />} />
        <Route path="/" element={<Navigate to="/customer/" />} />
        <Route
          path="/customer/product-preview/:id"
          element={<ProductPreview />}
        />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/profile/:id" element={<CustomerProfile />} />
        <Route path="/customer/products" element={<CustomerProducts />} />
        <Route path="/customer/payment" element={<PaymentSuccess />} />
      </Routes>
    </>
  );
}

export default App;
