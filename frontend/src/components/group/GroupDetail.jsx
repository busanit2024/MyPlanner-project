import { useParams } from "react-router-dom";
import styled from "styled-components";
import Button from "../../ui/Button";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import GroupScheduleItem from "./GroupScheduleItem";
import GroupBoardItem from "./GroupBoardItem";

const defaultGroupImageUrl = "/images/default/defaultGroupImage.png";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [settingBoxOpen, setSettingBoxOpen] = useState(false);
  const [boardType, setBoardType] = useState("schedule");

  return (
    <Container>
      <GroupHeader src={null}>
        <div className="background-image" />
        <GroupHeaderInner>
          <div className="left">
            <div className="group-image">
              <img src={defaultGroupImageUrl} alt="그룹 이미지" onError={(e) => e.target.src=defaultGroupImageUrl} />
            </div>
            <div className="group-info">
              <div className="name">그룹 이름</div>
              <div className="members">멤버 00명</div>
            </div>
          </div>
          <div className="right">
            <div className="setting">
              <div className="setting-icon" onClick={() => setSettingBoxOpen(!settingBoxOpen)}>
                <img src="/images/icon/settingWhite.svg" alt="setting" />
              </div>
              {settingBoxOpen && <SettingBox>
                <div>정보수정</div>
                <div>탈퇴하기</div>
              </SettingBox>}
            </div>

            <div className="button-group">
              <Button color="white">그룹 채팅</Button>
              <Button color="white">초대</Button>
              <Button color="primary">가입하기</Button>
            </div>

          </div>
        </GroupHeaderInner>
      </GroupHeader>

      <BoardTypeWrap>
        <div className={`board-type ${boardType === "schedule" ? "active" : ""}`} onClick={() => setBoardType("schedule")}>
          <span>일정</span>
          <div />
        </div>
        <div className={`board-type ${boardType === "board" ? "active" : ""}`} onClick={() => setBoardType("board")}>
          <span>게시판</span>
          <div />
        </div>
      </BoardTypeWrap>

      {boardType === "schedule" && <ListContainer>
        <div className="button-group">
          <Button color="primary">
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FaPlus />
              일정 추가
            </div>
          </Button>
          <select name="status" id="status">
            <option value="all">전체</option>
            <option value="ongoing">진행중</option>
            <option value="done">지난 일정</option>
          </select>
        </div>

        <GroupScheduleItem />

      </ListContainer>}

      {boardType === "board" && <ListContainer>
        <div className="button-group">
          <Button color="primary">글쓰기</Button>
          <SearchBox>
            <input type="text" placeholder="검색" />
            <div className="search-icon">
              <img src="/images/icon/search.svg" alt="search" />
            </div>
          </SearchBox>
        </div>

        <GroupBoardItem />

      </ListContainer>}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const GroupHeader = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 240px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: -1;
  }
  
  & .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-image: url(${(props) => props.src});
    z-index: -1;
  }
`;

const GroupHeaderInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  padding: 48px 128px;
  padding-top: 24px;
  box-sizing: border-box;

  & .left {
    display: flex;
    align-items: center;
    gap: 12px;

    & .group-image {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: var(--light-gray);

      & img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    & .group-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      & .name {
        font-size: 18px;
        font-weight: bold;
      }

      & .members {
        font-size: 16px;
      }
    }
  }

  & .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
    gap: 12px;
    flex-shrink: 0;

    & .setting {
      position: relative;
      flex-shrink: 0;
    }

    & .setting-icon {
      width: 36px;
      height: 36px;
      cursor: pointer;

      & img {
        width: 100%;
        height: 100%;
      }
    }

    & .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
`;

const SettingBox = styled.div`
  position: absolute;
  top: 36px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid var(--light-gray);
  background-color: white;
  z-index: 100;
  padding: 24px 36px;
  box-sizing: border-box;
  white-space: nowrap;

  & div {
    cursor: pointer;
    font-size: 18px;

    &:hover {
      color: var(--mid-gray);
    }
  }
`;


const BoardTypeWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 64px;
  border-bottom: 1px solid var(--light-gray);
  flex-shrink: 0;
  width: 100%;

  & .board-type {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    & span {
      font-size: 18px;
      justify-self: center;
      margin: auto;
    }

    & div {
      width: 120px;
      height: 2px;
      justify-self: flex-end;
      background-color: var(--light-gray);
    }

    &.active div {
      background-color: var(--primary-color);
    }

    &.active span {
      font-weight: bold;
    }
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 128px;
  box-sizing: border-box;
  width: 100%;

  & .button-group {
    display: flex;
    justify-content: space-between;
    gap: 12px;

    & select {
      padding: 0 12px;
      font-size: 16px;
      border: 1px solid var(--light-gray);
      border-radius: 4px;
      background-color: white;
      outline: none;

      & option {
        font-size: 16px;
        padding: 12px;
      }
    }
  }

  & .no-result {
    margin-top: 64px;
    font-size: 18px;
    text-align: center;
    color: var(--mid-gray);
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 12px;
  width: 40%;
  border-bottom: 1px solid var(--light-gray);
  padding: 0 12px;
  overflow: hidden;
  box-sizing: border-box;
  align-items: center;

  & input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-size: 16px;
  }

  & .search-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;

    & img {
      width: 100%;
      height: 100%;
    }
  }
`;