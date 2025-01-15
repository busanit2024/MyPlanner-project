export const getTextColor = (backgroundColor) => {
  if (!backgroundColor) return '#000000';
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 160 ? '#000000' : '#ffffff';
}