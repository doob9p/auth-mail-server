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
        console.log({ sendMail });

        return user;
      } catch (e) {
        console.log(e);

        throw Error("유저 생성을 실패하였습니다.");
      }
    },
  },
};
