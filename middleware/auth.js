// NOTE

import { verifyToken } from "../util/authUtil.js";

export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.sendStatus(403); // Forbidden
    }
    let user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error)
  }
};
