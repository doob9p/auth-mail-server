import express from "express";
const router = express.Router();

import jwt from "../jwt";
import prisma from "../prisma";

router.get("/", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "인증을 실패하였습니다." });
  }

  try {
    const payload = await jwt.decodeToken(token);

    const userCount = await prisma.user.count({ where: { id: payload.id } });
    if (userCount === 0) {
      return res.status(400).json({ message: "인증을 실패하였습니다." });
    }

    await prisma.user.update({
      where: { id: payload.id },
      data: { isAuthenticated: true },
    });

    return res.status(200).json({ message: "인증을 성공하였습니다." });
  } catch (e) {
    console.log(e);
    await prisma.disconnect();

    return res.status(400).json({ message: "인증을 실패하였습니다." });
  }
});

export default router;
