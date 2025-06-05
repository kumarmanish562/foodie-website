import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import { useCart } from "../../CartContext/CartContext";
import axios from "axios";

const Checkout = () => {
  const { totalAmount, cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Grab token
  const token = localStorage.getItem("authToken");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Payment gateway
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment_status");
    const sessionId = params.get("session_id");

    if (paymentStatus && paymentStatus !== "cancel") {
      setLoading(true);
      axios
        .post(
          "http://localhost:4000/api/orders/confirm",
          { sessionId },
          { headers: authHeaders }
        )
        .then(({ data }) => {
          clearCart();
          navigate("/myorders", { state: { order: data.order } });
        })
        .catch((err) => {
          console.error("payment confirmation failed", err);
          setError("Payment confirmation failed. Please contact support.");
        })
        .finally(() => setLoading(false));
    } else if (paymentStatus === "cancel") {
      setError("Payment was cancelled. Please contact support.");
      setLoading(false);
    }
  
  }, [location.search, authHeaders, clearCart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // submit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // calculate pricing
    const subtotal = Number(totalAmount.toFixed(2));
    const tax = Number((subtotal * 0.15).toFixed(2)); // 15% tax

    const payload = {
      ...formData,
      subtotal,
      tax,
      total: Number((subtotal + tax).toFixed(2)),
      items: cartItems.map(({ item, quantity }) => ({
        name: item.name,
        price: item.price,
        quantity,
        imageUrl: item.imageUrl || "",
      })),
    };
    try {
      if (formData.paymentMethod === "online") {
        const { data } = await axios.post(
          "http://localhost:4000/api/orders",
          payload,
          { headers: authHeaders }
        );
        window.location.href = data.checkoutUrl;
      } else {
        const { data } = await axios.post(
          "http://localhost:4000/api/orders",
          payload,
          { headers: authHeaders }
        );
        clearCart();
        navigate("/myorders", { state: { order: data.order } });
      }
    } catch (error) {
      console.error("Error occurred while processing payment:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while processing your order. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1212] to-[#2a1a1a] text-white py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Link className="flex items-center gap-2 text-green-400 mb-8" to="/cart">
          <FaArrowLeft className="text-2xl" />
          Back to Cart
        </Link>
        <h1 className="text-4xl font-bold mb-8 ">Checkout</h1>
        <form className="grid lg:grid-cols-2 gap-12" onSubmit={handleSubmit}>
          <div className="bg-[#4b3b3b]/80 p-6 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />
            <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
            <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
          </div>
          {/*  PAYMENT DETAILS */}
          <div className="bg-[#4b3b3b]/80 p-6 rounded-3xl space-y-6 mt-8">
            <h2 className="text-2xl font-bold">Payment Details</h2>
            {/* order items */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-amber-100">Your Orders Items</h3>
              {cartItems.map(({ _id, item, quantity }) => (
                <div key={_id} className="flex justify-between items-center bg-[#3b2b2b] p-4 rounded-lg">
                  <span className="text-green-100">{item.name}</span>
                  <span className="ml-2 text-sm text-green-100">{quantity}</span>
                  <span className="text-green-300">₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <PaymentSummary totalAmount={totalAmount} />
            <div>
              <label className="block mb-2 text-green-100">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="bg-[#3b2b2b] p-2 rounded-lg w-full px-4 py-3 "
              >
                <option value="">Select Payment Method</option>
                <option value="online">Online Payment</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              disabled={loading}
            >
              <FaLock className="mr-2" /> {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="bg-[#3b2b2b] p-2 rounded-xl w-full px-4 py-2 "
    />
  </div>
);

const PaymentSummary = ({ totalAmount }) => {
  const subtotal = Number(totalAmount.toFixed(2));
  const tax = Number((subtotal * 0.15).toFixed(2)); // 15% tax
  const total = Number((subtotal + tax).toFixed(2));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between ">
        <span>Tax (15%):</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center font-bold ">
        <span>Total:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default Checkout;