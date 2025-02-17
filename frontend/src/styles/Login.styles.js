import styled from "styled-components";

export const FullPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 100%;
`;

export const Logo = styled.div`
  width: 160px;
  cursor: pointer;
  & img {
    width: 100%;
  }
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: normal;
  margin: 0;
  margin-bottom: 24px;
`;

export const InputBox = styled.div`
  border-radius: 30px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: 760px;
  height : auto;
  display :flex;
  flex-direction : column;
  margin : 20px;
  padding : 36px 64px 96px 64px;
  align-items : center;
  gap: 24px;
  margin-bottom: 48px;
  box-sizing: border-box;
`;

export const TextAndLink = styled.p`
margin: 0;
display: flex;
justify-content: center;
align-items: center;
gap: 12px;
font-size: 16px;
`;
