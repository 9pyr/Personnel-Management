import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

const Layout = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center">
        <main className="max-w-[1024px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
