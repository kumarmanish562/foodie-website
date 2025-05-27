
// CHECKOUT PAGE DATA
const CheckoutPage = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '',
        email: '', address: '', city: '',
        zipCode: '', paymentMethod: ''
    });

    const payload = {
        ...formData,
        subtotal,
        tax,
        total: Number((subtotal + tax).toFixed(2)),
        items: cartItems.map(({ item, quantity }) => ({
            name: item.name,
            price: item.price,
            quantity,
            imageUrl: item.imageUrl || ''
        }))
    };

    return (
        {/* Personal Info Section */ }
        < div className = "bg-[#4b3b3b]/80 p-6 rounded-3xl space-y-6" >
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                        <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
                        <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
                    </div >
    )

}



// DUMMY DATA FOR MYORDERPAGE

                        const formattedOrders = response.data.map(order => ({
          ...order,
          items: order.items?.map(entry => ({
            _id: entry._id,
            item: {
              ...entry.item,
              imageUrl: entry.item.imageUrl,   // <-- CORRECT: pull from entry.item
            },
            quantity: entry.quantity
          })) || [],
          createdAt: new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          paymentStatus: order.paymentStatus?.toLowerCase() || 'pending'
        }));
                        
const statusStyles = {
    processing: {
        color: 'text-amber-400',
        bg: 'bg-amber-900/20',
        icon: <FiClock className="text-lg" />,
        label: 'Processing'
    },
    outForDelivery: {
        color: 'text-blue-400',
        bg: 'bg-blue-900/20',
        icon: <FiTruck className="text-lg" />,
        label: 'Out for Delivery'
    },
    delivered: {
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        icon: <FiCheckCircle className="text-lg" />,
        label: 'Delivered'
    },
    pending: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/20',
        icon: <FiClock className="text-lg" />,
        label: 'Payment Pending'
    },
    succeeded: {
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        icon: <FiCheckCircle className="text-lg" />,
        label: 'Completed'
    }
};

const getPaymentMethodDetails = (method) => {
    switch (method.toLowerCase()) {
        case 'cod':
            return {
                label: 'COD',
                class: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/50'
            };
        case 'card':
            return {
                label: 'Credit/Debit Card',
                class: 'bg-blue-600/30 text-blue-300 border-blue-500/50'
            };
        case 'upi':
            return {
                label: 'UPI Payment',
                class: 'bg-purple-600/30 text-purple-300 border-purple-500/50'
            };
        default:
            return {
                label: 'Online',
                class: 'bg-green-600/30 text-green-400 border-green-500/50'
            };
    }
};

<tr>
    <th className="p-4 text-left text-amber-400">Order ID</th>
    <th className="p-4 text-left text-amber-400">Customer</th>
    <th className="p-4 text-left text-amber-400">Address</th>
    <th className="p-4 text-left text-amber-400">Items</th>
    <th className="p-4 text-left text-amber-400">Total Items</th>
    <th className="p-4 text-left text-amber-400">Price</th>
    <th className="p-4 text-left text-amber-400">Payment</th>
    <th className="p-4 text-left text-amber-400">Status</th>
</tr>

{
    orders.map((order) => {
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = order.total ?? order.items.reduce(
            (sum, item) => sum + (item.item.price * item.quantity),
            0
        );
        const paymentMethod = getPaymentMethodDetails(order.paymentMethod);
        const status = statusStyles[order.status] || statusStyles.processing;
        const paymentStatus = statusStyles[order.paymentStatus] || statusStyles.pending;




               // CONTACT US
  // Build the message text from your formData:
  const message = `
    Name: ${formData.name}
    Phone: ${formData.phone}
    Email: ${formData.email}
    Address: ${formData.address}
    Dish: ${formData.dish}
    Query: ${formData.query}
  `;

+ const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

  setFormData({ name: '', phone: '', email: '', address: '', dish: '', query: '' });
}
