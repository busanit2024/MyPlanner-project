import styled from "styled-components";

const StyledTextarea = styled.textarea`
  padding: 12px;
  border-width: ${props => props.size === 'large' ? '2px' : '1px'};
  border-style: solid;
  border-color: var(--light-gray);
  border-radius: ${props => props.size === 'large' ? '8px' : '4px'};
  font-size: ${props => props.size === 'large' ? '18px' : '16px'};
  width: ${props => props.grow ? '100%' : 'auto'};
  flex-grow: ${props => props.grow ? 1 : 0};
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
  height: ${props => props.height ? `${props.height}px` : 'auto'};

  ${props => props.underline && `
    border: none;
    border-bottom: 2px solid;
    border-radius: 0;
  `}
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export default function Textarea(props){
  const { grow, placeholder, value, onChange, id, size, height } = props;

  return (
    <StyledTextarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      grow={grow}
      id={id}
      size={size}
      height={height}
    />
  );

}