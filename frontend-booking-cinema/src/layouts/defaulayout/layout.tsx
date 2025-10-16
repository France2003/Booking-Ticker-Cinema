import Footer from "../../components/footer"
import Header from "../../components/header"
import { Outlet } from "react-router-dom";
import { UserProvider } from "../../contexts/UserContext"
const DefaultLayOut = () => {
  return (
    <UserProvider>
      <div className="default-layout">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  )
}

export default DefaultLayOut