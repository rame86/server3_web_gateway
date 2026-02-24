import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing
import Home from "./pages/Home";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import UserStore from "./pages/user/UserStore";
import UserEvents from "./pages/user/UserEvents";
import UserChat from "./pages/user/UserChat";
import UserCommunity from "./pages/user/UserCommunity";
import UserArtists from "./pages/user/UserArtists";
import UserWallet from "./pages/user/UserWallet";
import UserEventDetail from "./pages/user/UserEventDetail";
import UserBookingProcess from "./pages/user/UserBookingProcess";
import UserStoreDetail from "./pages/user/UserStoreDetail";
import UserPurchaseProcess from "./pages/user/UserPurchaseProcess";

// Auth pages
import UserLogin from "./pages/auth/UserLogin";
import UserSignup from "./pages/auth/UserSignup";

// Artist pages
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import ArtistFandom from "./pages/artist/ArtistFandom";
import ArtistSettlement from "./pages/artist/ArtistSettlement";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminStore from "./pages/admin/AdminStore";
import AdminBooking from "./pages/admin/AdminBooking";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminSettlement from "./pages/admin/AdminSettlement";

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Home} />

      {/* Auth Routes */}
      <Route path="/login" component={UserLogin} />
      <Route path="/signup" component={UserSignup} />

      {/* User Routes */}
      <Route path="/user" component={UserDashboard} />
      <Route path="/user/store" component={UserStore} />
      <Route path="/user/store/:id" component={UserStoreDetail} />
      <Route path="/user/store/purchase/:id" component={UserPurchaseProcess} />
      <Route path="/user/booking" component={UserEvents} />
      <Route path="/user/events" component={UserEvents} />
      <Route path="/user/events/:id" component={UserEventDetail} />
      <Route path="/user/booking/:id" component={UserBookingProcess} />
      <Route path="/user/chat" component={UserChat} />
      <Route path="/user/community" component={UserCommunity} />
      <Route path="/user/artists" component={UserArtists} />
      <Route path="/user/wallet" component={UserWallet} />

      {/* Artist Routes */}
      <Route path="/artist" component={ArtistDashboard} />
      <Route path="/artist/fandom" component={ArtistFandom} />
      <Route path="/artist/store" component={ArtistFandom} />
      <Route path="/artist/chat" component={ArtistFandom} />
      <Route path="/artist/booking" component={ArtistFandom} />
      <Route path="/artist/community" component={ArtistFandom} />
      <Route path="/artist/events" component={ArtistFandom} />
      <Route path="/artist/donations" component={ArtistSettlement} />
      <Route path="/artist/settlement" component={ArtistSettlement} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/artists" component={AdminArtists} />
      <Route path="/admin/store" component={AdminStore} />
      <Route path="/admin/booking" component={AdminBooking} />
      <Route path="/admin/community" component={AdminCommunity} />
      <Route path="/admin/settlement" component={AdminSettlement} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>);

}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>);

}

export default App;