export const calculateDate = (date) => {
  const today = new Date();
  const regDate = new Date(date);
  const diffTime = Math.abs(today - regDate);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  if (diffYears > 0) {
    return `${diffYears}년`;
  }
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  if (diffMonths > 0) {
    return `${diffMonths}개월`;
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return `${diffDays}일`;
  }

  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `${diffHours}시간`;
  }

  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  return `${diffMinutes}분`;
}