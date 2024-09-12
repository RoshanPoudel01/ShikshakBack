import jwt from "jsonwebtoken";
import Token from "../../model/tokenModal";
const JWT_SECRET = process.env.JWT_SECRET || "shikshaktoken";
const REFRESH_TOKEN_PRIVATE_KEY =
  process.env.REFRESH_TOKEN_PRIVATE || "shikshaktoken";
export const createToken = async (id: number, roles: string[]) => {
  if (JWT_SECRET) {
    const token = jwt.sign(
      {
        id,
        roles,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    const refresh_token = jwt.sign({ id }, REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "60m",
    });
    const refreshToken = refresh_token.slice(
      refresh_token.lastIndexOf(".") + 1
    );
    // Calculate the expiry date/time
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // JWT_EXPIRY is "1d"

    // Store the token and its expiry in the database
    await Token.create({
      userId: id,
      token,
      refreshToken,
      expiry,
    });

    // Return the token
    return { token, refreshToken };
  } else {
    return null;
  }
};
