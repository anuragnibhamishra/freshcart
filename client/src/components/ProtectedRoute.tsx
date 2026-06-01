import { Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default ProtectedRoute
