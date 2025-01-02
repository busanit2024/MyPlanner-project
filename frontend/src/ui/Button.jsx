import styled from "styled-components";

const StyledButton = styled.button`
  padding: 8px 18px;
  background-color: #fff;
  color: var(--dark-gray);
  border: 1px solid var(--mid-gray);
  border-radius: ${props => props.rect ? '6px' : '24px'};
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }

  ${props => props.disabled && `
      background-color: var(--light-gray);
      color: var(--mid-gray);
      cursor: normal;
    `
  }

  ${props => {
    if (props.size === 'large') {
      return `
        padding: 10px 24px;
        font-size: 20px;

      `;
    }

    if (props.size === 'small') {
      return `
        padding: 6px 12px;
        font-size: 14px;
      `;
    }
  }
  }

  ${props => {

    switch (props.color) {
      case 'primary':
        return `
          background-color: var(--primary-color);
          color: white;
          border: none;
        `;
      case 'danger':
        return `
          background-color: var(--danger-color);
          color: white;
          border: none;
        `;
      case 'unselected':
        return `
          background-color: var(--light-gray);
          color: black;
          border: none;
        `; 
      default:
        return '';
    }
  }
  }
`;


export default function Button({ children, onClick, ...props }) {
  const { rect, color, size, grow, disabled } = props;
  return <StyledButton onClick={onClick}
    rect={rect}
    color={color}
    size={size}
    grow={grow}
    disabled={disabled}
  >
    {children}
  </StyledButton>;
}