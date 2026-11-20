// import './App.css'
import Register from "./component/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserDashbord from "./pages/UserDashbord";
import Login from "./component/Login";
import ProductDetailPage from "./component/ProductDetailPage";
import SellerDashbord from "./pages/SellerDashbord";
import ProductCart from "./component/ProductCart";
import RequireUser from "./component/RequireUser";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import MyOrders from "./pages/MyOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Temperary Route */}
        <Route path="/user-dashbord" element={<UserDashbord />} />
        <Route path="/Product-detail" element={<ProductDetailPage />} />
        <Route path="/seller-dashbord" element={<SellerDashbord />} />
        <Route path="/product-cart" element={<ProductCart />} />
        <Route
          path="/checkout"
          element={
            <RequireUser>
              <Checkout />
            </RequireUser>
          }
        />
        <Route
          path="/order-success"
          element={
            <RequireUser>
              <OrderSuccess />
            </RequireUser>
          }
        />
        <Route
          path="/payment-cancelled"
          element={
            <RequireUser>
              <PaymentCancelled />
            </RequireUser>
          }
        />
        <Route
          path="/my-orders"
          element={
            <RequireUser>
              <MyOrders />
            </RequireUser>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
