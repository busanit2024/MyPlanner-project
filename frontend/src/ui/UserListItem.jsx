import styled from "styled-components";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chip from "./Chip";
import Swal from "sweetalert2";

const defaultProfileImageUrl = "/images/default/defaultProfileImage.png";

export default function UserListItem({ user: item }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);
  const [isMyAccount, setIsMyAccount] = useState(false);

  useEffect(() => {
    if (user) {
      checkFollow();
      checkFollowsMe();
      checkMyAccount();
    }
  }, [user]);

  const onFollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = item?.id;

    if (isFollowing) {
      return;
    }

    axios.get(`/api/user/follow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`follow id ${targetUserId}`, res.data);
        setIsFollowing(true);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const onUnfollow = () => {
    if (loading || !user) {
      return;
    }

    const userId = user?.id;
    const targetUserId = item?.id;

    if (!isFollowing) {
      return;
    }

    axios.get(`/api/user/unfollow`, { params: { userId, targetUserId } })
      .then(res => {
        console.log(`unfollow id ${targetUserId}`, res.data);
        setIsFollowing(false);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const checkFollow = () => {
    const itemFollowers = item?.followers ?? [];
    const isFollow = itemFollowers.some(follower => follower === user?.id);
    setIsFollowing(isFollow);
  }

  const checkFollowsMe = () => {
    const followers = user?.followers ?? [];
    const follows = followers.some(follower => follower === item?.id);
    setFollowsMe(follows);
  }

  const checkMyAccount = () => {
    if (user?.id === item?.id) {
      setIsMyAccount(true);
    }
  }

  const handleUnfollowButton = () => {
    Swal.fire({
      title: "언팔로우하기",
      text: "이 회원을 언팔로우하시겠어요?",
      showCancelButton: true,
      confirmButtonText: "언팔로우",
      cancelButtonText: "취소",
      customClass: {
        //App.css에 정의된 클래스 사용
        title: "swal-title",
        htmlContainer: "swal-text-container",
        confirmButton: "swal-button swal-button-danger",
        cancelButton: "swal-button swal-button-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onUnfollow();
      }
    });
  }

  //채팅기능
  const handleMessageClick = async () => {
    try {
      const response = await axios.get(`/api/chat/rooms/user/${user.email}`);
      const chatRooms = response.data;
      
      const existingRoom = chatRooms.find(room => 
        room.chatRoomType === "INDIVIDUAL" && 
        room.participants.some(p => p.email === item.email)
      );

      if (existingRoom) {
        const otherUser = {
          email: item.email,
          name: item.username,
          profileImage: item.profileImageUrl || '/images/default/defaultProfileImage.png'
        };
        navigate('/chat', { 
          state: { 
            initialRoom: {
              ...existingRoom,
              participants: existingRoom.participants.map(p => 
                p.email === item.email 
                  ? { ...p, name: item.username, profileImage: item.profileImageUrl || '/images/default/defaultProfileImage.png' }
                  : p
              )
            },
            initialPartner: otherUser
          }
        });
      } else {
        const chatRoomRequest = {
          participantIds: [
            { 
              email: user.email,
              name: user.username,
              profileImage: user.profileImageUrl || '/images/default/defaultProfileImage.png',
              status: "ACTIVE" 
            },
            { 
              email: item.email,
              name: item.username,
              profileImage: item.profileImageUrl || '/images/default/defaultProfileImage.png',
              status: "ACTIVE" 
            }
          ],
          chatroomTitle: item.username,
          chatroomType: "INDIVIDUAL"
        };

        const newRoomResponse = await axios.post('/api/chat/rooms', chatRoomRequest);
        const newRoom = newRoomResponse.data;
        
        navigate('/chat', { 
          state: { 
            initialRoom: newRoom,
            initialPartner: {
              email: item.email,
              name: item.username,
              profileImage: item.profileImageUrl
            }
          }
        });
      }
    } catch (error) {
      console.error('채팅방 생성/조회 실패:', error);
      Swal.fire({
        title: "오류",
        text: "채팅방을 열 수 없습니다. 다시 시도해주세요.",
        icon: "error",
      });
    }
  };

  return (
    <Container className="user-list-item">
      <div className="left">
        <Avatar>
          <img src={item?.profileImageUrl ?? defaultProfileImageUrl} alt="profile" onError={(e) => (e.target.src = defaultProfileImageUrl )} />
        </Avatar>
        <Info>
          <span className="name">{item?.username}
            {(!isMyAccount && followsMe) && <Chip size="small" style={{ marginLeft: "8px" }}>나를 팔로우함</Chip> }
          </span>
          <span className="email">{item?.email}</span>

        </Info>

      </div>

      <div className="right">
        { !isMyAccount && 
        <>
        {isFollowing &&
          <div className="message-icon">
            <img src="/images/icon/message.svg" alt="message" onClick={handleMessageClick}  />
          </div>
        }
        {isFollowing ? <Button onClick={handleUnfollowButton} >팔로잉</Button> : <Button color="primary" onClick={onFollow}>팔로우하기</Button>}
        </> }
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;

  & .left {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  & .right {
    display: flex;
    align-items: center;
    gap: 12px;

    & .message-icon {
      cursor: pointer;
      width: 36px;
      height: 36px;

      & img {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--light-gray);
  
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    image-rendering: auto;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 12px;

  & .name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
  }

  & .email {
    color: var(--mid-gray);
  }
`;