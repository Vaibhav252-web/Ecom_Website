// import './App.css'
import Register from "./component/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserDashbord from "./pages/UserDashbord";
import Login from "./component/Login";
import ProductDetailPage from "./component/ProductDetailPage";
import SellerDashbord from "./pages/SellerDashbord";
import ProductCart from "./component/ProductCart";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
