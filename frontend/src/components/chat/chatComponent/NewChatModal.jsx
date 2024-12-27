import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;

    .modal-header {
      display: flex;
      font-size: 20px;
    }
    
    .cancel-icon {
      cursor: pointer;
      width: 24px;
      height: 24px;

      & img {
      width: 100%;
      height: 100%;
      margin-top: 5px;
      
      }
    }

    .search-user {
      display: flex;
      width: 24px;
      height: 24px;
      margin-top: 15px;

      & img {
        width: 100%;
        height: 100%;
      }
    }
    
    
`;

const NewChatModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <div className="modal-header">
                    <div className="cancel-icon" onClick={onClose}>
                        <img src="images/icon/cancel.svg" alt="cancel" />
                    </div>
                    <span style={{ marginLeft: '10px' }}>새 쪽지</span>
                </div>
                <div className='search-user'>
                    <img src="images/icon/search.svg" alt="search" />                    
                    <input style={{ marginLeft: '10px', fontSize: '22px', border: 'none' }} type="text" placeholder='사용자 검색' />
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default NewChatModal;