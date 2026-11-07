import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NewInvoicePage from "./pages/newInvoice";
import ViewInvoicePage from "./pages/viewInvoices";
import SettingsPage from "./pages/Settings";
import ReviewInvoice from "./pages/ReviewInvoice";
import PaymentSuccess from "./pages/PaymentSuccess";
import Notifications from "./pages/Notifications";
import CustomersPage from "./pages/customers/CustomersPage";
import CustomerDetailsPage from "./pages/customers/CustomerDetailsPage";
import NativeInvoiceStudio from "./pages/NativeInvoiceStudio";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
        <Route path="/new-invoice" element={<NewInvoicePage />} />
        <Route path="/invoice" element={<Navigate to="/view-invoices" replace />} />
        <Route path="/invoice-studio" element={<NativeInvoiceStudio />} />
        <Route path="/invoice/:id" element={<InvoiceDetailsPage />} />
        <Route path="/view-invoices" element={<ViewInvoicePage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/review/:id" element={<ReviewInvoice />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route
          path="/notifications"
          element={<Notifications />}
        />
      </Routes>
    </NotificationProvider>
  );
}

export default App;