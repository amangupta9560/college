import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import { ThemeProvider } from './Context/ThemeContext.jsx';
import { SocketProvider } from './Context/SocketContext.jsx';
import { ChatProvider } from './Context/ChatContext.jsx';
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';

// Pages
import LandingPage from './Pages/LandingPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import VerifyOTPPage from './Pages/VerifyOTPPage.jsx';
import ForgotPasswordPage from './Pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './Pages/ResetPasswordPage.jsx';
import DashboardPage from './Pages/DashboardPage.jsx';
import ProfilePage from './Pages/ProfilePage.jsx';
import EditProfilePage from './Pages/EditProfilePage.jsx';
import DiscoverPage from './Pages/DiscoverPage.jsx';
import TeamsPage from './Pages/TeamsPage.jsx';
import CreateTeamPage from './Pages/CreateTeamPage.jsx';
import ManageTeamPage from './Pages/ManageTeamPage.jsx';
import TeamDetailPage from './Pages/TeamDetailPage.jsx';
import PublicProfilePage from './Pages/PublicProfilePage.jsx';
import HackathonsPage from './Pages/HackathonsPage.jsx';
import CreateHackathonPage from './Pages/CreateHackathonPage.jsx';
import HackathonDetailPage from './Pages/HackathonDetailPage.jsx';
import ManageHackathonPage from './Pages/ManageHackathonPage.jsx';
import ProjectsPage from './Pages/ProjectsPage.jsx';
import CreateProjectPage from './Pages/CreateProjectPage.jsx';
import ProjectDetailPage from './Pages/ProjectDetailPage.jsx';
import SettingsPage from './Pages/SettingsPage.jsx';
import NotificationsPage from './Pages/NotificationsPage.jsx';
import ChatPage from './Pages/ChatPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen bg-surface transition-colors duration-200">
                <Navbar />
                
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-otp" element={<VerifyOTPPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/edit" element={<EditProfilePage />} />
                      <Route path="/discover" element={<DiscoverPage />} />
                      <Route path="/teams" element={<TeamsPage />} />
                      <Route path="/teams/create" element={<CreateTeamPage />} />
                      <Route path="/teams/manage/:id" element={<ManageTeamPage />} />
                      <Route path="/teams/:slug" element={<TeamDetailPage />} />
                      <Route path="/users/:id" element={<PublicProfilePage />} />
                      <Route path="/hackathons" element={<HackathonsPage />} />
                      <Route path="/hackathons/create" element={<CreateHackathonPage />} />
                      <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
                      <Route path="/hackathons/manage/:id" element={<ManageHackathonPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/create" element={<CreateProjectPage />} />
                      <Route path="/projects/:id" element={<ProjectDetailPage />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                    </Route>

                    {/* Catch-all 404 */}
                    <Route path="*" element={
                      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
                        <h1 className="text-5xl font-extrabold text-primary">404</h1>
                        <h2 className="text-xl font-bold">Page Not Found</h2>
                        <p className="text-base-content/60 max-w-xs">The page you are looking for does not exist or has been moved.</p>
                        <a href="/" className="btn btn-primary rounded-xl btn-sm font-semibold mt-2">Go Home</a>
                      </div>
                    } />
                  </Routes>
                </main>

                <Footer />
              </div>
            </BrowserRouter>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}