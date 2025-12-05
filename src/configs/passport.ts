import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import config from "./env.ts";
import User from "../modules/user/user.model.ts";
import { tokenType } from "./tokens.ts";
import passport from "passport";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: any, done: any) => {
  try {
    if (payload.type !== tokenType.ACCESS) {
      throw new Error("Invalid token type");
    }
    const user = await User.findById(payload._id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

passport.use(jwtStrategy);

export default {
  jwtStrategy,
};
