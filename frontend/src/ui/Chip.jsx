import styled from "styled-components";

export default function Chip({ children, size }) {
  return (
    <ChipWrap size={size}>
      {children}
    </ChipWrap>
  );
}

const ChipWrap = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 16px;
  border: 1px solid var(--light-gray);
  font-size: 14px;
  gap: 4px;
  font-weight: normal;
  color: var(--mid-gray);

  ${props => props.size === 'small' && `
    padding: 2px 6px;
    font-size: 12px;
  `}
`;