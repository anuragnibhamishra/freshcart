import { lazy, Suspense } from "react"
import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import AppLayout from "./pages/AppLayout"
import Home from "./pages/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./pages/admin/AdminLayout"
import DeliveryLayout from "./pages/delivery/DeliveryLayout"
import Loading from "./components/Home/Loading"

const Login = lazy(() => import("./pages/Login"))
const Products = lazy(() => import("./pages/Products"))
const FlashDeals = lazy(() => import("./pages/FlashDeals"))
const SearchResults = lazy(() => import("./pages/SearchResults"))
const ProductPage = lazy(() => import("./pages/ProductPage"))
const Checkout = lazy(() => import("./pages/Checkout"))
const Addresses = lazy(() => import("./pages/Addresses"))
const MyOrder = lazy(() => import("./pages/MyOrder"))
const OrderTracking = lazy(() => import("./pages/OrderTracking"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"))
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"))
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"))
const AdminDeliveryPartners = lazy(() => import("./pages/admin/AdminDeliveryPartners"))
const DeliveryLogin = lazy(() => import("./pages/delivery/DeliveryLogin"))
const DeliveryDashboard = lazy(() => import("./pages/delivery/DeliveryDashboard"))

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{duration:3000, style: {background : "#1B3022", color: "#fff", borderRadius: "12px", fontSize: "14px"}}} />
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />} >
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="deals" element={<FlashDeals />} />
          <Route element={<ProtectedRoute />} >
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrder />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
        </Route>

        <Route path="/delivery/login" element={<DeliveryLogin />}/>
        <Route path="/delivery" element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboard />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}

export default App
