import styled from "styled-components";

const StyledInput = styled.input`
  padding: 12px;
  border-width: ${props => props.size === 'large' ? '2px' : '1px'};
  border-style: solid;
  border-color: var(--light-gray);
  border-radius: ${props => props.size === 'large' ? '8px' : '4px'};
  font-size: ${props => props.size === 'large' ? '18px' : '16px'};
  width: ${props => props.grow ? '100%' : 'auto'};
  flex-grow: ${props => props.grow ? 1 : 0};
  box-sizing: border-box;

  ${props => props.underline && `
    border: none;
    border-bottom: 1px solid;
    border-color: var(--light-gray);
    border-radius: 0;
  `}


  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export default function Input(props) {
  const { id, type, placeholder, value, onChange, onInput, underline, grow, size } = props;

  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onInput={onInput}
      underline={underline}
      grow={grow}
      id={id}
      size={size}
    />
  );

}