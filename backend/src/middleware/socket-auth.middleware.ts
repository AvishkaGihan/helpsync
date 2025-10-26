import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt.types";

export const authenticateSocketToken = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.role = decoded.role;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};
