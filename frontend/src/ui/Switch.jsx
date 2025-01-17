import styled from "styled-components";

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: ${props => props.size === "small" ? "40px" : "56px"};
  height: ${props => props.size === "small" ? "20px" : "32px"};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--light-gray);
    transition: 0.2s;
    border-radius: ${props => props.size === "small" ? "16px" : "28px"};
  }

  .slider:before {
    position: absolute;
    content: "";
    height: ${props => props.size === "small" ? "14px" : "24px"};
    width: ${props => props.size === "small" ? "14px" : "24px"};
    left: ${props => props.size === "small" ? "3px" : "4px"};
    bottom: ${props => props.size === "small" ? "3px" : "4px"};
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--primary-color)
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--light-gray);
  }

  input:checked + .slider:before {
    transform: translateX(${props => props.size === "small" ? "20px" : "24px"});
  }

  .slider.round {
    border-radius: ${props => props.size === "small" ? "16px" : "28px"};
  }

  .slider.round:before {
    border-radius: 50%;
  }
`;


export default function Switch(props) {
  const { value, onChange, size } = props;
  return (
    <SwitchWrapper size={size}>
      <input type="checkbox" checked={value} onChange={onChange} />
      <span className="slider round"></span>
    </SwitchWrapper>
  );
}