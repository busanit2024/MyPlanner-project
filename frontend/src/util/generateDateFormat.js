// 시작, 끝 날짜와 시간 받아와서 포맷팅

export const generateDateFormat = (startDate, startTime, endDate, endTime) => {
  // 날짜 인풋 포맷: 2025-01-08T00:00:00.000+00:00
  // 시간 인풋 포맷: 24:00
  // 날짜 출력 포맷: 2025-01-08
  // 연도 부분이 올해와 같은 경우엔 월-일만 출력
  if (!startDate || !endDate) return "";

  const today = new Date();
  const year = today.getFullYear();
  const splitStartDate = startDate.split("T")[0];
  const splitEndDate = endDate.split("T")[0];
  const formatStartDate = splitStartDate.slice(0, 4) === year.toString() ? splitStartDate.slice(5) : splitStartDate;
  const formatEndDate = splitEndDate.slice(0, 4) === year.toString() ? splitEndDate.slice(5) : splitEndDate;

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