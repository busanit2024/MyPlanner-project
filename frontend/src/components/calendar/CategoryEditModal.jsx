import styled from "styled-components"
import Button from "../../ui/Button";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function CategoryEditModal(props) {
  const { user, loadUser, loading } = useAuth();
  const { categories, onClose } = props;
  const [updatedCategories, setUpdatedCategories] = useState(categories);
  const [colorPickerOpenIndex, setColorPickerOpenIndex] = useState(-1);

  const addCategory = () => {
    const newCategory = {
      id: null,
      categoryName: "",
      color: "#939393",
    };
    setUpdatedCategories([...updatedCategories, newCategory]);
  };

  const toggleColorPickerOpen = (index) => {
    if (colorPickerOpenIndex === index) {
      setColorPickerOpenIndex(-1);
    } else {
      setColorPickerOpenIndex(index);
    }
  };

  const handleColorChange = (color, index) => {
    const newCategories = [...updatedCategories];
    newCategories[index].color = color;
    setUpdatedCategories(newCategories);
  };

  const handleUpdate = () => {
    if (loading) {
      return;
    }

    if (!loading && !user) {
      return;
    }

    const categoryList = updatedCategories.filter((category) => category.categoryName !== "");
    axios.post(`/api/user/updateCategory?userId=${user.id}`, 
    categoryList
    )
    .then(() => {
      loadUser();
      onClose();
    })
    .catch((error) => {
      console.error(error);
    });
  };

  return (
    <Container onClick={onClose}>
      <BoxContainer onClick={(e) => e.stopPropagation()}>
        <div className="header">
        <h2 className="title">카테고리 편집</h2>
        <div className="close" onClick={onClose}>
          <img src="/images/icon/cancel.svg" alt="close" />
        </div>
        </div>
        <CategoryList>
          {updatedCategories.map((category, index) => (
            <CategoryListItem key={category.id} color={category.color}>
              <div className={`color-box ${colorPickerOpenIndex === index ? "active" : ""}`}
              onClick={() => toggleColorPickerOpen(index)} ></div>
              {colorPickerOpenIndex === index && (
                  <ColorPickerWrap onClick={(e) => e.stopPropagation()}>
                  <ChromePicker
                    color={category.color}
                    onChange={(color) => handleColorChange(color.hex, index)}
                    disableAlpha={true}
                  />
                  </ColorPickerWrap>
                )}
              <input type="text" value={category.categoryName} onChange={(e) => {
                const newCategories = [...updatedCategories];
                newCategories[index].categoryName = e.target.value;
                setUpdatedCategories(newCategories);
              }}
              placeholder="새 카테고리" />
              <div className="delete" onClick={() => {
                const newCategories = updatedCategories.filter((_, i) => i !== index);
                setUpdatedCategories(newCategories);
              }}>
                <img src="/images/icon/trash.svg" alt="delete" />
              </div>
            </CategoryListItem>
          ))}
          <div className="add-category" onClick={addCategory}>
            <img src="/images/icon/plus.svg" alt="plus" />
            <span>카테고리 추가</span>
          </div>
        </CategoryList>
        <div className="button-wrap">
          <Button onClick={onClose}>취소</Button>
          <Button color="primary" onClick={handleUpdate}>저장</Button>
        </div>
        
      </BoxContainer>

    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 100;

  & img {
      width: 100%;
      height: 100%;
    }
`;

const BoxContainer = styled.div`
  background-color: white;
  padding: 36px;
  border-radius: 8px;
  border: 1px solid var(--light-gray);
  z-index: 101;
  box-sizing: border-box;
  min-width: 300px;

  & .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  & .title {
    font-size: 24px;
    margin: 0;
  }

  & .close {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  & .button-wrap {
    display: flex;
    margin-top: 24px;
    justify-content: center;
    gap: 12px;
  }
`;

const CategoryList = styled.div`  
  display: flex;
  flex-direction: column;
  gap: 8px;

  & .add-category {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    & img {
      width: 24px;
      height: 24px;
    }
  }

  & .delete {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`;

const CategoryListItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  & .color-box {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${(props) => props.color};
    cursor: pointer;
    flex-shrink: 0;

    &.active {
      border: 1px solid var(--mid-gray);
    }
  }

  & input {
    border: none;
    border-bottom: 1px solid var(--light-gray);
    padding: 4px;
    width: 100%;
    outline: none;
    font-size: 16px;
    font-family: inherit;
  }
`

const ColorPickerWrap = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 102;
  top: 0;
  right: calc(100% + 48px);
  cursor: default;
`;