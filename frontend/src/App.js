import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import MainPage from './components/main/MainPage';
import ChatPage from './components/chat/ChatPage';
import GlobalStyles from './styles/GlobalStyles.styles';
import CalendarWrite from './components/calendar/CalendarWrite';

function App() {
return (
    <Router>
      <GlobalStyles />
      <Routes>
        <Route element={<Layout />} >
          <Route index element={<MainPage />} />
          <Route path="calendar" element={<MainPage />} />
          <Route path="/chat" element={<ChatPage />} />

          <Route path='calendarWrite' element={<CalendarWrite />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;
