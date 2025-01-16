// 시작, 끝 날짜와 시간 받아와서 포맷팅

export const generateDateFormat = (startDate, startTime, endDate, endTime, type = 'short') => {
  // 날짜 인풋 포맷: 2025-01-08T00:00:00.000+00:00
  // 시간 인풋 포맷: 24:00
  if (!startDate || !endDate) return "";
  const today = new Date();
  const year = today.getFullYear();
  const splitStartDate = startDate.split("T")[0];
  const splitEndDate = endDate.split("T")[0];

  if (type === 'short') {
    // 날짜 출력 포맷: 2025-01-08
    // 연도 부분이 올해와 같은 경우엔 월-일만 출력


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
  }

  if (type === 'long') {
    //시간 출력 포맷: 오전 10:00
    //날짜 출력 포맷: 2025년 1월 8일
    const startYear = splitStartDate.slice(0, 4);
    const startMonth = splitStartDate.slice(5, 7).replace(/^0+/, '');
    const startDay = splitStartDate.slice(8).replace(/^0+/, '');
    const endYear = splitEndDate.slice(0, 4);
    const endMonth = splitEndDate.slice(5, 7).replace(/^0+/, '');
    const endDay = splitEndDate.slice(8).replace(/^0+/, '');

    const formatStartDate = `${startYear}년 ${startMonth}월 ${startDay}일`;
    const formatEndDate = `${endYear}년 ${endMonth}월 ${endDay}일`;

    if (!startTime && !endTime) {
      if (formatStartDate === formatEndDate) {
        return formatStartDate;
      } else {
        return `${formatStartDate} ~ ${formatEndDate}`;
      }
    } else {
      return `${formatStartDate} ${startTime} ~ ${formatEndDate} ${endTime}`;
    }

  }



};