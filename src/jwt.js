import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const decodeToken = async (token) =>
  await jwt.verify(token, process.env.JWT_SECRET || "");

export default { generateToken, decodeToken };
