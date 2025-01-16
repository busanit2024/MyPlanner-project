export const generateISOString = (date, time) => {
  // 날짜 인풋 포맷: 2025-01-08T00:00:00.000+00:00
  // 시간 인풋 포맷: 24:00

  if (!date) return "";

  const splitDate = date.split("T")[0];
  const splitTime = time || "00:00";

  return `${splitDate}T${splitTime}:00.000+00:00`;

};