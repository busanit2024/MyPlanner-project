import styled from 'styled-components';

const SystemMessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: ${props => props.margin || '16px 0'};
`;

const MessageContent = styled.div`
    background-color: ${props => props.backgroundColor};
    color: ${props => props.color};
    padding: ${props => props.padding||'4px 10px'};
    border-radius: 15px;
    font-size: ${props => props.fontSize || '14px'};
`;

export default function SystemMessage({ content, backgroundColor, color, padding, fontSize, margin }) {
    return (
        <SystemMessageContainer margin={margin}>
            <MessageContent
             backgroundColor={backgroundColor}
             color={color}
             padding={padding}
             fontSize={fontSize}
             >
            {content}
            </MessageContent>
        </SystemMessageContainer>
    );
}