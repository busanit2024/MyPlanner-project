// 시작, 끝 날짜와 시간 받아와서 포맷팅

export const generateDateFormat = (startDate, startTime, endDate, endTime) => {
  // 날짜 인풋 포맷: 2025-01-08T00:00:00.000+00:00
  // 시간 인풋 포맷: 24:00
  // 날짜 출력 포맷: 2025-01-08
  if (!startDate || !endDate) return "";

  const formatStartDate = startDate.split("T")[0];
  const formatEndDate = endDate.split("T")[0];
  
  if (!startTime && !endTime) {
    if (formatStartDate === formatEndDate) {
      return formatStartDate;
    } else {
      return `${formatStartDate} ~ ${formatEndDate}`;
    }
  } else {
    return `${formatStartDate} ${startTime} ~ ${formatEndDate} ${endTime}`;
  }
};