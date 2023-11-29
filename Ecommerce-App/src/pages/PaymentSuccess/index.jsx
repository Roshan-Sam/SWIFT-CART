import React from "react";
import { useState } from "react";
import { Modal, Result } from "antd";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [isOrderPlacedModalVisible, setIsOrderPlacedModalVisible] =
    useState(true);
  const navigate = useNavigate();

  const hideOrderPlacedModal = () => {
    setIsOrderPlacedModalVisible(false);
    navigate("/customer/");
  };
  return (
    <div>
      <Modal
        visible={isOrderPlacedModalVisible}
        footer={null}
        onCancel={hideOrderPlacedModal}
        destroyOnClose
      >
        <Result
          status="success"
          title={`orders placed successfully`}
          subTitle="Thank you for your order. Your order has been placed successfully."
        />
      </Modal>
    </div>
  );
};

export default PaymentSuccess;
