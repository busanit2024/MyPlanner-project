import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import LoginPage from './components/user/LoginPage';
import RegisterPage from './components/user/RegisterPage';
import ChatPage from './components/chat/ChatPage';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles.styles';

import CalendarWrite from './components/calendar/CalendarWrite';
import WeeklyPage from './components/calendar/WeeklyPage';
import DailyPage from './components/calendar/DailyPage';
import Grid100Page from './components/calendar/Grid100Page';
import CalendarPage from './components/calendar/CalendarPage';

import IndexPage from './components/main/IndexPage';
import FindPage from './components/user/FindPage';
import SearchPage from './components/search/SearchPage';
import { SearchProvider } from './context/SearchContext';
import MyPage from './components/user/MyPage';
import ProfileEditPage from './components/user/ProfileEditPage';
import NotificationPage from './components/user/NotificationPage';
import { NotiProvider } from './context/NotiContext';


function App() {
  return (
    <AuthProvider>
      <Router>
        <NotiProvider>
          <SearchProvider>
            <GlobalStyles />
            <Routes>

              <Route path="/login" element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/find' element={<FindPage />} />

              <Route element={<Layout />}>
                <Route index element={<IndexPage />} />
                <Route path='/search' element={<SearchPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/weekly" element={<WeeklyPage />} />
                <Route path="/daily" element={<DailyPage />} />
                <Route path="/grid" element={<Grid100Page/>} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="chat/:roomId" element={<ChatPage />} />
                <Route path='/profile' element={<MyPage />} />
                <Route path='profile/edit' element={<ProfileEditPage />} />
                <Route path='notification' element={<NotificationPage />} />
                <Route path='calendarWrite' element={<CalendarWrite />} />
              </Route>
            </Routes>
          </SearchProvider>
        </NotiProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
