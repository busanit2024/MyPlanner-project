import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

  :root {
    --primary-color: #F9AD47;
    --accent-text-color: #F79200;
    --danger-color: #EC3B40;
    --dark-gray: #333;
    --mid-gray: #666;
    --light-gray: #D9D9D9;
    --layout-padding: 36px 48px;
    --white : #FFFFFF;
    --light-primary : #FFE7BA;
    --chat-gray : #f2f2f2;
    --black : #000000;
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

    ::-webkit-scrollbar {
    width: 8px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--light-gray);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }
  }

  a {
    color: var(--accent-text-color);
  }

  img {
    image-rendering: auto;
  }

`;

export default GlobalStyles;