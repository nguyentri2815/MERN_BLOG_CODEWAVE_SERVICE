import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

export const hashString = async (string) => {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashed = await bcrypt.hash(string, salt);
    return hashed;
  } catch (error) {
    console.log("error", error);
  }
};
export const compareString = async (string, hash) => {
  try {
    const isMatch = await bcrypt.compare(string, hash);
    return isMatch;
  } catch (error) {
    console.log("error", error);
  }
};

export const createToken = async (payload) => {
  try {
    const token = await jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.log("error", error);
  }
};
export const verifyToken = async (token) => {
  try {
    const decoded = await jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET_KEY
    );
    return decoded;
  } catch (error) {
    console.log("error", error);
  }
};
