import SideBar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import { useEffect, useState } from "react";
import { Card, Statistic, Table, Image } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Chart as NewChart } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./sellerdashboard.css";

const SellerDasdboard = () => {
  const sellerId = localStorage.getItem("sellerId");
  const [products, setProducts] = useState(0);
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState();
  const [recentOrders, setRecentOrders] = useState([]);
  const [profitLoss, setProfitLoss] = useState({});
  const navigate = useNavigate();

  const getProductData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/products/?sellerId=${sellerId}`
      );
      setProducts(response.data.sellerProducts.length);
    } catch (e) {
      console.log(e);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/order/", {
        params: { sellerId: sellerId },
      });

      const uniqueUsers = new Set();
      response.data.forEach((order) => {
        uniqueUsers.add(order.customerId);
      });

      setUsers(Array.from(uniqueUsers).length);
      setOrders(response.data.length);

      const data = response.data;
      const updatedProducts = [];
      await Promise.all(
        data.map(async (item) => {
          const res = await axios.get(
            `http://localhost:8000/products/${item.products[0].productId}`
          );
          const productPrice = res.data.price;
          updatedProducts.push({
            ...item,
            products: [{ ...item.products[0], productPrice: productPrice }],
          });
        })
      );
      setUpdatedProducts(updatedProducts);

      if (Array.isArray(updatedProducts) && updatedProducts.length > 0) {
        const totalSales = updatedProducts.reduce((acc, order) => {
          const product = order.products[0];
          if (product.productPrice && product.quantity) {
            return acc + product.quantity * product.productPrice;
          } else {
            return acc;
          }
        }, 0);
        setTotalSales(totalSales);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProductData();
    getUsers();
  }, []);

  useEffect(() => {
    const sortedOrders = updatedProducts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recentOrders = sortedOrders.slice(0, 3);

    const fetchCustomerDetails = async () => {
      const ordersWithCustomerDetails = [];
      for (const order of recentOrders) {
        const customer = await getCustomerDetails(order.customerId);
        ordersWithCustomerDetails.push({
          image: customer.image,
          customerName: customer.name,
          totalPrice:
            order.products[0].productPrice * order.products[0].quantity,
          orderDate: new Date(order.createdAt).toLocaleDateString("en-GB"),
        });
      }
      setRecentOrders(ordersWithCustomerDetails);
    };
    fetchCustomerDetails();
  }, [updatedProducts]);

  const getCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/customer/${customerId}`
      );
      return response.data;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const getSalesChartData = () => {
      if (!Array.isArray(updatedProducts) || updatedProducts.length === 0) {
        console.error("No sales data available.");
        return;
      }

      const currentDate = new Date().toLocaleDateString("en-GB");
      const uniqueDates = [
        ...new Set(
          updatedProducts.map((order) =>
            new Date(order.createdAt).toLocaleDateString("en-GB")
          )
        ),
      ];

      const salesData = uniqueDates.map((date) => {
        const ordersOnDate = updatedProducts.filter(
          (order) =>
            new Date(order.createdAt).toLocaleDateString("en-GB") === date
        );

        const totalSalesOnDate = ordersOnDate.reduce(
          (acc, order) =>
            acc + order.products[0].productPrice * order.products[0].quantity,
          0
        );

        return {
          date,
          totalSales: totalSalesOnDate,
          isCurrentDay: date === currentDate,
        };
      });

      if (salesData.length === 0) {
        console.error("No sales data available.");
        return;
      }

      const sortedSalesData = salesData
        .slice()
        .sort((a, b) => b.totalSales - a.totalSales);

      const maxSalesDate = sortedSalesData[0];

      const secondMaxSalesDate = sortedSalesData[1];

      const currentDaySales =
        salesData.find((data) => data.isCurrentDay)?.totalSales || 0;

      let comparedToMaxSales;
      if (currentDaySales === maxSalesDate?.totalSales) {
        comparedToMaxSales =
          currentDaySales - (secondMaxSalesDate?.totalSales || 0);
      } else {
        comparedToMaxSales = currentDaySales - (maxSalesDate?.totalSales || 0);
      }

      const isProfit = comparedToMaxSales >= 0;

      const chartData = {
        labels: salesData.map((data) => data.date),
        datasets: [
          {
            label: "Total Sales",
            data: salesData.map((data) => data.totalSales),
            backgroundColor: salesData.map((data) =>
              data.isCurrentDay
                ? "rgba(75, 192, 192, 0.5)"
                : "rgba(255, 99, 132, 0.2)"
            ),
            borderColor: salesData.map((data) =>
              data.isCurrentDay
                ? "rgba(75, 192, 192, 1)"
                : "rgba(255, 99, 132, 1)"
            ),
            borderWidth: 1,
          },
        ],
      };

      const profitLossText = isProfit ? "Profit" : "Loss";
      const comparedToMaxSalesText = isProfit
        ? `₹${comparedToMaxSales}`
        : `-₹${Math.abs(comparedToMaxSales)}`;

      setChartData(chartData);
      setProfitLoss({
        text: profitLossText,
        value: comparedToMaxSalesText,
      });
    };

    getSalesChartData();
  }, [updatedProducts]);

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error(error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div>
            Something went wrong. Please refresh the page or try again later.
          </div>
        );
      }

      return this.props.children;
    }
  }

  console.log("updated", updatedProducts);
  console.log("recent", recentOrders);
  return (
    <ErrorBoundary>
      <>
        <div className="seller-dashboard-container">
          <SideBar />
          <div className="seller-dashboard-main">
            <Navbar heading="Dashboard" />
            <div className="seller-dashboard-main-1">
              <div className="seller-dashboard-main-1-1">
                <Card
                  className="dashboard-card"
                  style={{
                    background:
                      "linear-gradient(230deg, #759bff 0%, #843cf6 50%, #759bff 100%)",
                  }}
                  onClick={() => navigate("/seller/users")}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontFamily: "sans-serif",
                        }}
                      >
                        Total Users
                      </span>
                    }
                    value={users}
                    prefix={<UserOutlined />}
                    valueStyle={{
                      color: "white",
                      fontSize: "20px",
                      fontFamily: "sans-serif",
                    }}
                  />
                </Card>
                <Card
                  className="dashboard-card"
                  style={{
                    background: "linear-gradient(230deg, #fc5286, #fbaaa2)",
                  }}
                  onClick={() => navigate("/seller/order")}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontFamily: "sans-serif",
                        }}
                      >
                        Total Orders
                      </span>
                    }
                    value={orders}
                    prefix={<ShoppingOutlined />}
                    valueStyle={{
                      color: "white",
                      fontSize: "20px",
                      fontFamily: "sans-serif",
                    }}
                  />
                </Card>
                <Card
                  className="dashboard-card"
                  style={{
                    background: "linear-gradient(230deg, #ffc480, #ff763b)",
                  }}
                  onClick={() => navigate("/seller/inventory")}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontFamily: "sans-serif",
                        }}
                      >
                        Total Products
                      </span>
                    }
                    value={products}
                    prefix={<BoxPlotOutlined />}
                    valueStyle={{
                      color: "white",
                      fontSize: "20px",
                      fontFamily: "sans-serif",
                    }}
                  />
                </Card>
                <Card
                  className="dashboard-card"
                  style={{
                    background: "linear-gradient(230deg, #0e4cfd, #6a8eff)",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontFamily: "sans-serif",
                        }}
                      >
                        Total Sales
                      </span>
                    }
                    value={totalSales}
                    prefix={`₹`}
                    valueStyle={{
                      color: "white",
                      fontSize: "20px",
                      fontFamily: "sans-serif",
                    }}
                  />
                </Card>
              </div>
              <div className="seller-dashboard-main-1-2">
                <div className="seller-dashboard-main-1-2-1">
                  <h2>Total Sales Per Day</h2>
                  {chartData ? (
                    <Bar data={chartData} />
                  ) : (
                    <Bar
                      data={{
                        labels: ["No Data"],
                        datasets: [
                          {
                            label: "Total Sales",
                            data: [0],
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  )}{" "}
                  <p>
                    {profitLoss.text}: {profitLoss.value}
                  </p>
                </div>
                <div className="seller-dashboard-main-1-2-2">
                  <h2>Recent Orders</h2>
                  <div className="recent-orders">
                    <Table
                      dataSource={recentOrders}
                      pagination={false}
                      rowKey={(record, index) => index}
                      size="large"
                      className="table-container"
                    >
                      <Table.Column
                        title="Customer"
                        dataIndex="customerName"
                        key="customerName"
                        className="table-head"
                        render={(text, record) => (
                          <div className="customer-info">
                            <Image
                              src={record.image}
                              alt={record.customerName}
                              width={50}
                              height={50}
                              crossOrigin=""
                              style={{
                                borderRadius: "50px",
                                objectFit: "cover",
                              }}
                              className="customer-image"
                            />
                            <div className="customer-details">
                              <p className="customer-name">{text}</p>
                            </div>
                          </div>
                        )}
                      />
                      <Table.Column
                        title="Total Price"
                        dataIndex="totalPrice"
                        key="totalPrice"
                        className="table-header"
                      />
                      <Table.Column
                        title="Order Date"
                        dataIndex="orderDate"
                        key="orderDate"
                        className="table-header"
                      />
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
};

export default SellerDasdboard;
