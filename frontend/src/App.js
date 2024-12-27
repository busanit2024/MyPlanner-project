import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import LoginPage from './components/user/LoginPage';
import ChatPage from './components/chat/ChatPage';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles.styles';
import CalendarPage from './components/calendar/CalendarPage';
import RegisterPage from './components/user/RegisterPage';
import CalendarWrite from './components/calendar/CalendarWrite';
import IndexPage from './components/main/IndexPage';
import FindPage from './components/user/FindPage';


function App() {
return (
  <AuthProvider>
    <Router>
      <GlobalStyles />
      <Routes>
        <Route index element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/find' element={<FindPage />} />
        <Route element={<Layout />} >
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<ChatPage />} />

          <Route path='calendarWrite' element={<CalendarWrite />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
