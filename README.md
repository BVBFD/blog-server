# Blog Project Server with ExpressJS

### [ 👉 블로그 바로가기 ✍️ ](https://lsevina126.netlify.app)

![nodejs-expressjs](https://github.com/BVBFD/blog-server/assets/83178592/ee70ea08-efc3-44f7-95ab-389760e4c100)

## 사용스킬
<div style="display: flex; width: 100%;">
  <span style="flex: 1;" target="_blank">
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=fff" />
  </span>
  <span style="flex: 1;" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=fff" />
  </span>
  <span style="flex: 1;" target="_blank">
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=Express&logoColor=fff" />
  </span>
  <span style="flex: 1;" target="_blank">
    <img src="https://img.shields.io/badge/Hostinger-673DE6?style=for-the-badge&logo=Hostinger&logoColor=fff" />
  </span>
  <span style="flex: 1;" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=fff" />
  </span>
</div>

## 프로젝트 소개

- 블로그 프로젝트 백엔드 서버 `CRUD` 기능 및 이미지 업로드 및 저장해서 블로그에 적용해보기.
- `accessToken`, `refreshToken` 논리, 로직을 구성해보면서, 개념 이해 및 기능 구현에 집중해보기.
- `Hostinger`의 `VPS` 가상컴퓨터에 서버 코드 배포해보기.

## 프로젝트 주요 구조

```
blog-project-server
├─ .env              // 환경변수 관련 설정 (github에는 올라가 있지 않음)
├─ controllers       // 각각 http 요청 url routes 경로에서 실행될 콜백함수 등록
├─ middlewares
│  └─ verifyToken.js // verifyToken accessToken, refreshToken 토큰 검증 미들웨어
├─ models      // MongoDB document 스키마 정의
├─ routes      // REST APIs http 요청 url 경로 지정 및 콜백함수 연결
├─ .gitignore  // github에 올리지 않을 파일 설정
└─ app.js      // 서버 실행 파일
```

## 블로그 기록 사항 - 개발 및 유지 보수

- 2024.02.02 : [ NextJS 블로그 동적 SEO 구현 여정기 ](https://lsevina126.netlify.app/post/65bcd867390620f004440afe)
- 2024.01.05 : [ 개인 블로그 사이트 성능 개선 및 트러블 슈팅 해결 여정기 ](https://lsevina126.netlify.app/post/65979ed57a920683806df985)
- 2023.03.29 : [ NextJS, ReactJS - Pagination 구현 ( Feat. 라이브러리 없이 구현 ) ](https://lsevina126.netlify.app/post/642350ca059244411a587631)
- 2023.03.14 : [ NextJS 프로젝트 환경 세팅하기 - ESLint, Prettier, Airbnb Code Style ](https://lsevina126.netlify.app/post/640fcdaf059244411a581e19)
- 2023.03.14 : [ husky 에 대하여... ](https://lsevina126.netlify.app/post/640fbf8f059244411a581db4)
- 2023.01.28 : [ NextJS 기본 개념 정리 ](https://lsevina126.netlify.app/post/63d4ad1b2e757991f51cf24a)
