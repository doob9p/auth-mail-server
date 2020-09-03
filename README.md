# **✉️ 이메일 본인확인**

<br>
<br>
<br>

# 🏷 프로세스

1. 유저가 회원가입 할 때 이메일 주소를 받는다.
2. 이메일 주소와 계정 활성화 여부(default: false)를 DB에 등록한다.
3. 유저 이메일 주소로 토큰값을 담은 URL을 발송한다. (`http://localhost:3000/auth?token=a3f32fdsf32423.......`)
4. 유저가 이메일 확인후 해당 URL에 접속하면 계정을 활성화 시킨다.

<br>
<br>
<br>

# 🏷 Model

```graphql
model User {
  id              String  @default(cuid()) @id
  email           String  @unique
  isAuthenticated Boolean @default(false)
}
```

- id: `cuid` 값을 기본으로 자동생성
- email: 유저 이메일
- isAuthenticated: 계정 인증 여부, 기본값 `false`

<br>
<br>
<br>

# 🏷 1. 유저 생성

```jsx
import prisma from "../../../prisma";
import mail from "../../../mail";
import jwt from "../../../jwt";

export default {
  Mutation: {
    createUser: async (_, args) => {
      const { email } = args;

      try {
        // 이메일 중복 검사
        const userCount = await prisma.user.count({ where: { email } });
        if (userCount !== 0) {
          return null;
        }

        // 유저 생성
        const user = await prisma.user.create({
          data: { email },
          select: { id: true },
        });

        // 토큰 생성
        const generateToken = jwt.generateToken(user.id);

        // 메일 발송
        const sendMail = await mail.sendMail({
          to: email,
          subject: "📬 이메일 등록 확인 메일",
          text: `본 메일은 회원가입을 하시려는 고객님께 본인 확인을 위해 발송되었습니다.
          
http://localhost:4000/auth?token=${generateToken}`,
        });

        return user;
      } catch (e) {
        console.log(e);

        throw Error("유저 생성을 실패하였습니다.");
      }
    },
  },
};
```

1. 유저 이메일 중복 검사
2. 유저 생성
3. 생성한 유저의 id 값으로 jwt 생성
4. 토큰을 메일 본문에 담아 메일 발송

<br>
<br>
<br>

# 🏷 2. 메일 확인

http://localhost:4000/auth?token=[토큰 값]


- 본문에 담긴 URL 클릭

<br>
<br>
<br>

# 🏷 3. 토큰 확인 API

```jsx
// API - /auth

import express from "express";
const router = express.Router();

import jwt from "../jwt";
import prisma from "../prisma";

router.get("/", async (req, res) => {
	// 토큰 값 확인
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "인증을 실패하였습니다." });
  }

  try {
		// 토큰 값 decode
    const payload = await jwt.decodeToken(token);

		// 유저 id 여부 체크
    const userCount = await prisma.user.count({ where: { id: payload.id } });
    if (userCount === 0) {
      return res.status(400).json({ message: "인증을 실패하였습니다." });
    }

		// 유저 계정 활성화
    await prisma.user.update({
      where: { id: payload.id },
      data: { isAuthenticated: true },
    });

    return res.status(200).json({ message: "인증을 성공하였습니다." });
  } catch (e) {
    console.log(e);

    return res.status(400).json({ message: "인증을 실패하였습니다." });
  }
});

export default router;
```

1. /auth - API의 token 값 확인
2. 토큰값 decode
3. decode된 유저 id 값 여부 체크
4. 유저 계정 활성화