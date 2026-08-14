import { Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-invoice" element={<NewInvoicePage />} />
      <Route path="/view-invoices" element={<ViewInvoicePage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      <Route path="/review/:id" element={<ReviewInvoice />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route
  path="/notifications"
  element={<Notifications />}
/>
    </Routes>
  );
}

export default App;