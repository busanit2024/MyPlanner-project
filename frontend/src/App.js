import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import LoginPage from './components/user/LoginPage';
import RegisterPage from './components/user/RegisterPage';
import ChatPage from './components/chat/ChatPage';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles.styles';

import CalendarWrite from './components/calendar/CalendarWrite';
import Grid100Page from './components/calendar/Grid100Page';
import CalendarPage from './components/calendar/CalendarPage';
import CalendarUpdate from './components/calendar/CalendarUpdate';

import IndexPage from './components/main/IndexPage';
import FindPage from './components/user/FindPage';
import SearchPage from './components/search/SearchPage';
import { SearchProvider } from './context/SearchContext';
import MyPage from './components/user/MyPage';
import ProfileEditPage from './components/user/ProfileEditPage';
import NotificationPage from './components/user/NotificationPage';
import { NotiProvider } from './context/NotiContext';
import FeedPage from './components/feed/FeedPage';
import UserProfilePage from './components/user/UserProfilePage';
import GroupPage from './components/group/GroupPage';
import GroupDetail from './components/group/GroupDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotiProvider>
          <SearchProvider>
            <GlobalStyles />
            <Routes>
              <Route index element={<IndexPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/find' element={<FindPage />} />
              <Route element={<Layout />} >
                <Route path='/search' element={<SearchPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/grid" element={<Grid100Page />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path='profile' element={<MyPage />} />
                <Route path='profile/edit' element={<ProfileEditPage />} />
                <Route path='notification' element={<NotificationPage />} />
                <Route path='calendarWrite' element={<CalendarWrite />} />
                <Route path='calendarUpdate/:id' element={<CalendarUpdate />} />
                <Route path="schedule/:id" element={<CalendarUpdate />} />
                <Route path='feed' element={<FeedPage />} />
                <Route path='user/:userId' element={<UserProfilePage />} />
                <Route path='group' element={<GroupPage />} />
                <Route path='group/:groupId' element={<GroupDetail />} />
              </Route>
              <Route path="chat/:roomId" element={<ChatPage />} />
            </Routes>
          </SearchProvider>
        </NotiProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
