import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import MainPage from './components/main/MainPage';
import LoginPage from './components/user/LoginPage';
import ChatPage from './components/chat/ChatPage';

import GlobalStyles from './styles/GlobalStyles.styles';
import CalendarPage from './components/calendar/CalendarPage';
import RegisterPage from './components/user/RegisterPage';
import { AuthProvider } from './context/AuthContext';

function App() {
return (
  <AuthProvider>
    <Router>
      <GlobalStyles />
      <Routes>
        <Route index element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route element={<Layout />} >
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
