import React, { useState } from "react";
import "../../css/Grid100Page.css";

const Grid100Page = () => {
  const [selectedYear, setSelectedYear] = useState(null); // 클릭된 연도 저장
  const currentYear = new Date().getFullYear(); // 현재 연도
  const startYear = 1924; // 100년 캘린더의 시작 연도

  const handleCellClick = (year) => {
    setSelectedYear(year); // 클릭된 연도를 상태에 저장
  };

  return (
    <div className="grid-container">
      <h1>100-Year Grid</h1>
      <div className="grid">
        {Array.from({ length: 100 }, (_, index) => {
          const year = startYear + index; // 연도 계산
          const isCurrentYear = year === currentYear;

          return (
            <div
              key={year}
              className={`grid-cell ${isCurrentYear ? "current-year" : ""}`}
              onClick={() => handleCellClick(year)}
            >
              {year}
            </div>
          );
        })}
      </div>

      {selectedYear && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedYear}년</h2>
            <p>이 연도에 대한 추가 정보를 여기에 표시하세요.</p>
            <button onClick={() => setSelectedYear(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grid100Page;
