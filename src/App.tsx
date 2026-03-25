import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import MenuPage from "./pages/MenuPage";
import TraySizesPage from "./pages/TraySizesPage";
import TrayPricesPage from "./pages/TrayPricesPage";
import TrayPriceCategoryPage from "./pages/TrayPriceCategoryPage";
import CuisineMenuPage from "./pages/CuisineMenuPage";
import OrderPage from "./pages/OrderPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import OurMenu from "@/pages/our_menu";
import NotFound from "./pages/NotFound";
import NimirChat from "@/components/NimirChat";
import CheckoutPage from "./pages/CheckoutPage";
import SalesDashboard from "@/pages/SalesDashboard";
import SalesOrderDetail     from "@/pages/SalesOrderDetail";
import SalesOverrideRequest from "@/pages/SalesOverrideRequest";
import OverrideApprovalsDashboard from "@/pages/OverrideApprovalsDashboard";
import RecordOutcomesPage from "@/pages/RecordOutcomesPage";
import OwnerDashboard from "@/pages/OwnerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:slug" element={<CuisineMenuPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/tray-sizes" element={<TraySizesPage />} />
            <Route path="/tray-prices" element={<TrayPricesPage />} />
            <Route path="/tray-prices/:slug" element={<TrayPriceCategoryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/our_menu" element={<OurMenu />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/orders/:requestId"           element={<SalesOrderDetail />} />
            <Route path="/sales/override-request/:requestId" element={<SalesOverrideRequest />} />
            <Route path="/approvals/dashboard" element={<OverrideApprovalsDashboard />} />
            <Route path="/approvals/dashboard" element={<OverrideApprovalsDashboard />} />
            <Route path="/outcomes/new"        element={<RecordOutcomesPage />} /> 
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path= "/admin/dashboard" element= {<AdminDashboard /> } />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NimirChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
