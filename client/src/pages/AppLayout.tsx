import { Outlet } from "react-router-dom"
import Banner from "../components/Banner"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CartSideBar from "../components/CartSideBar"

const AppLayout = () => {
  return (
    <>
      <Banner />
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <CartSideBar />
    </>
  )
}

export default AppLayout
