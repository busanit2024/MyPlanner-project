import styled from 'styled-components';

const GroupImageContainer = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
`;

const ParticipantImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: absolute;
  border: 2px solid white;

  &:nth-child(1) {
    top: 0;
    left: 0;
  }

  &:nth-child(2) {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const TeamChatProfileImage = ({ participants, currentUserEmail }) => {
  // 현재 사용자를 제외한 참여자들
  const otherParticipants = participants.filter(p => p.email !== currentUserEmail);
  
  return (
    <GroupImageContainer>
      {otherParticipants.slice(0, 2).map((participant, index) => (
        <ParticipantImage
          key={participant.email}
          src={participant.profileImageUrl || '/images/default/defaultProfileImage.png'}
          alt={`참여자 ${index + 1}`}
          onError={(e) => {
            e.target.src = '/images/default/defaultProfileImage.png';
          }}
        />
      ))}
    </GroupImageContainer>
  );
};

export default TeamChatProfileImage;