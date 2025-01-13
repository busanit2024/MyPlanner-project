import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("schedule");
  const [onSearch, setOnSearch] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [onWriteSchedule, setOnWriteSchedule] = useState(null);
  const [onEditSchedule, setOnEditSchedule] = useState(null);
  const [onDeleteSchedule, setOnDeleteSchedule] = useState(null);

  const handleWriteSchedule = () => {
    if (onWriteSchedule) {
      onWriteSchedule();
    }
  }

  const handleEditSchedule = () => {
    if (onEditSchedule) {
      onEditSchedule();
    }
  }

  const handleDeleteSchedule = () => {
    if (onDeleteSchedule) {
      onDeleteSchedule();
    }
  }

  useEffect(() => {
    if (!location.pathname.includes(`/search`)) {
      setSearchText("");
      setSearchType("schedule");
    }
  }, [location]);

  const handleSearch = () => {
    if (searchText) {
      if (location.pathname.includes(`/search`) && onSearch) {
        onSearch(searchText, searchType);
      } else {
        navigate(`/search`);
      }
    }
  };

  return (
    <SearchContext.Provider value={{searchText, setSearchText, handleSearch, setOnSearch, searchType, setSearchType, handleWriteSchedule, handleEditSchedule, handleDeleteSchedule, setOnWriteSchedule, setOnEditSchedule, setOnDeleteSchedule}}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  return useContext(SearchContext);
}