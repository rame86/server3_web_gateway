import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";

// Landing
import Home from "./pages/Home";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import UserStore from "./pages/user/UserStore";
import UserEvents from "./pages/user/UserEvents";
import UserChat from "./pages/user/UserChat";
import UserCommunity from "./pages/user/UserCommunity";
import UserCommunityDetail from "./pages/user/UserCommunityDetail";
import UserCommunityWrite from './pages/user/UserCommunityWrite'; 
import UserArtists from "./pages/user/UserArtists";
import UserWallet from "./pages/user/UserWallet";
import UserWalletSuccess from "./pages/user/UserWalletSuccess";
import UserWalletFail from "./pages/user/UserWalletFail";
import UserWalletCancel from "./pages/user/UserWalletCancel";
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
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
<<<<<<< HEAD
    const memberId = params.get("member_id");
    const role = params.get("role");
    const name = params.get("name");

    if (token) {
      try {
        // 1. 브라우저 지갑(LocalStorage)에 저장
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token); // 호환성을 위해 두 키 모두 저장

        // 2. ID, Role, Name 저장
        if (memberId) localStorage.setItem("memberId", memberId);
        if (role) localStorage.setItem("role", role); 
        if (name) localStorage.setItem("userName", name);

        console.log("지갑 저장 및 리다이렉트 데이터 처리 성공!", { memberId, role, name });

        // 3. 주소창 청소
        window.history.replaceState({}, null, window.location.pathname);
        
        // 대시보드로 이동
        setLocation("/user"); 
        
      } catch (e) {
        console.error("토큰 처리 중 에러!", e);
=======

    if (token) {
      try {
        // MSA 표준 토큰 저장 키 사용
        localStorage.setItem("TOKEN", token);

        const base64Payload = token.split('.')[1]; 
        const payload = JSON.parse(atob(base64Payload)); 
        
        localStorage.setItem("memberId", payload.sub);
        localStorage.setItem("role", payload.role); 

        window.history.replaceState({}, null, window.location.pathname);
        setLocation("/user"); 
        
        alert(`${payload.sub}님, 환영합니다!`);
      } catch (e) {
        console.error("Token processing error:", e);
>>>>>>> ae427ecbcbc2bc4aae25e9ce4d068f4ef1114a81
      }
    }
  }, [setLocation]);

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
      
      {/* 커뮤니티 경로: 구체적인 경로(write)를 동적 파라미터(:id)보다 먼저 선언해야 합니다. */}
      <Route path="/user/community" component={UserCommunity} />
      <Route path="/user/community/write" component={UserCommunityWrite} />
      <Route path="/user/community/:id" component={UserCommunityDetail} />
      
      <Route path="/user/artists" component={UserArtists} />
      <Route path="/user/wallet" component={UserWallet} />
      <Route path="/user/wallet/success" component={UserWalletSuccess} />
      <Route path="/user/wallet/fail" component={UserWalletFail} />
      <Route path="/user/wallet/cancel" component={UserWalletCancel} />

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
    </Switch>
  );
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
    </ErrorBoundary>
  );
}

export default App;