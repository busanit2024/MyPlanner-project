import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

  :root {
    --primary-color: #FFAE00;
    --dark-gray: #333;
    --mid-gray: #666;
    --light-gray: #D9D9D9;
  }

  /* 
    스타일 적용할 때 변수 사용 권장!
    예: color: var(--primary-color);
    이외 앱 전체에서 사용할 만한 스타일은 :root 안에 선언해 주세요.
  */

  body {
    margin: 0;
    padding: 0;
    font-family: 'Noto Sans KR', sans-serif;
    height: 100vh;
  }
`;

export default GlobalStyles;