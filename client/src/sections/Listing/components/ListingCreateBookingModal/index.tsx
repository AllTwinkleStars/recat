import React from "react";
import {
  CardElement,
  injectStripe,
  ReactStripeElements,
} from "react-stripe-elements";
import { Button, Divider, Modal, Typography } from "antd";
import moment, { Moment } from "moment";
import { KeyOutlined } from "@ant-design/icons";
import { formatListingPrice } from "../../../../lib/utils";

interface Props {
  price: number;
  checkInDate: Moment;
  checkOutDate: Moment;
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
  price,
  checkInDate,
  checkOutDate,
  modalVisible,
  setModalVisible,
  stripe,
}: Props & ReactStripeElements.InjectedStripeProps) => {
  const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
  const listingPrice = price * daysBooked;

  const handleCreateBooking = async () => {
    if (!stripe) {
      return;
    }

    let { token: stripeToken } = await stripe.createToken();
  };

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-booking-modal__intro-title">
            <KeyOutlined />
          </Title>
          <Title level={3} className="listing-booking-modal__intro-title">
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing from the dates
            between {moment(checkInDate).format("MMMM Do YYYY")} to{" "}
            {moment(checkOutDate).format("MMMM Do YYYY")}, inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(price, false)}/day for {daysBooked} days ={" "}
            <Text strong>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
          <Paragraph>
            Total ={" "}
            <Text strong>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement
            hidePostalCode
            className="listing-booking-modal__strip-card"
          />
          <Divider />
          <Button
            size="large"
            type="primary"
            className="listing-booking-modal__cta"
            onClick={handleCreateBooking}
          >
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const WrappedListingCreateBookingModal = injectStripe(
  ListingCreateBookingModal
);
