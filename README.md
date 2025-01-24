# Circle Project
MyPlanner-project를 위해 사용한 코드입니다. Spring Boot와 React를 활용하여 Circle 웹 애플리케이션을 구현하였습니다.


## 프로젝트 소개
내 일정을 친구들과 쉽게 공유할 수 있는 SNS형 웹 플래너입니다. 실시간으로 내 일정을 공유하고, 반응할 수 있는 웹 어플리케이션을 제작해보았습니다.

## 개발 기간
- 2024.12.19 ~ 2025.01.24
- 아이디어 회의
- 발표 평가

## 개발자 소개
- 이상헌 : 팀장, 일정 등록 및 수정
- 오용호 : 캘린더 구현
- 엄채연 : 로그인/회원가입, 유저 관리
- 송민지 : 실시간 채팅
- 정수현 : 실시간 채팅

## 기술 스택
-Frontend : React, JavaScript
-Backend : Java, Spring Boot (WAS : Tomcat)
-DataBase : MySQL, MongoDB
-BaaS : Firebase
-Collaboratoins : Discord, Notion, Figma

## 프로젝트 아키텍쳐

## 주요 기능
- 일정 관리
  - 일정을 등록, 수정, 삭제하는 기본 CRUD와, 일정을 완료하는 로직을 구현함. 
- 일정 공유
  - 일정 등록 후 피드에 자동 업데이트 되어 나를 팔로우하는 사용자들이 볼 수 있도록
- 피드
  -  
- 실시간 채팅
  - 사용자가 채팅방에 입장하면 웹소켓이 연결되어 실시간으로 채팅할 수 있도록 함.
  - 이미지, 일정 전송 시 메시지 타입을 설정하여 배열로 저장함.
  - 사용자가 채팅방을 나갔을 경우, 백엔드에서 System 메시지로 "~가 나갔습니다" 전송함.
  - 채팅방ID 기반으로 DB를 구성하여 단체 채팅도 동일한 로직으로 구현함.
