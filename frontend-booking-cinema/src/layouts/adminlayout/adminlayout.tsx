import Sidebar from "../../components/Admin/Layout.Sidebar";
import Navbar from "../../components/Admin/Layout.Navbar";
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
