const jwt = require("jsonwebtoken");
const tokenDatasModel = require("../models/tokenDatasModel"); // tokenDatasModel을 가져와야 합니다.

const verifyToken = async (req, res, next) => {
  if (!req.body.author) {
    return res.status(400).json({ message: "로그인을 해주세요!!" });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  let user;

  try {
    // accessToken 검증
    user = jwt.verify(accessToken, `${process.env.JWT_SECRET_KEY}`);
  } catch (error) {
    // accessToken 유효기간 혹은 쿠키기간 만료시 에러
    // refreshToken 담는 cookie가 만료되었을 경우
    if (refreshToken === undefined) {
      await tokenDatasModel.findOneAndDelete({
        userId: req.body.userId || req.body.author,
      });
      // 쿠키 유효기간 만료시 에러 클라이언트에게 보내서 로그아웃 신호 줄것
      return res
        .status(244)
        .json({ message: "Access forbidden, invalid refreshToken" });
    }

    // refreshToken을 담는 cookie가 유효기간이 남아 refreshToken이 정상적으로 살아있다면
    const storedToken = await tokenDatasModel.findOne({
      refreshToken,
    });

    // refreshToken 검증
    try {
      jwt.verify(storedToken.refreshToken, `${process.env.JWT_SECRET_KEY}`);
    } catch (error) {
      if (error.message === "jwt expired") {
        await tokenDatasModel.findOneAndDelete({
          refreshToken: storedToken.refreshToken,
        });
        // 쿠키 유효기간 만료되지 않았지만 refreshToken 검증 에러시
        // 클라이언트에게 보내서 로그아웃 신호 줄것
        return res
          .status(244)
          .json({ message: "Access forbidden, invalid refreshToken" });
      }
    }

    // accessToken과 refreshToken 재발급
    if (refreshToken && refreshToken === storedToken.refreshToken) {
      const newAccessToken = jwt.sign(
        { userId: storedToken.userId, editable: storedToken.editable },
        `${process.env.JWT_SECRET_KEY}`,
        {
          expiresIn: "3h",
        }
      );
      const newRefreshToken = jwt.sign(
        { userId: storedToken.userId, editable: storedToken.editable },
        `${process.env.JWT_SECRET_KEY}`,
        {
          expiresIn: "1d",
        }
      );

      // mongodb 업데이트
      const updatedStoredToken = await tokenDatasModel.findOneAndUpdate(
        { accessToken: storedToken.accessToken },
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        { new: true }
      );

      // cookie도 업데이트
      res.cookie("accessToken", newAccessToken, {
        // 3시간동안 유효
        maxAge: 10800000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      res.cookie("refreshToken", newRefreshToken, {
        // 하루동안 유효
        maxAge: 259200000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      // refresh 토근 검증 통과 그리고 새로운 accessToken, refreshToken 발급받고 다음 로직으로 넘어간다.
      req.user = {
        userId: updatedStoredToken.userId,
        editable: updatedStoredToken.editable,
      };

      return req.user.userId && req.user.editable && next();
    }
  }

  // Access Token이 유효한 경우
  if (user.userId && user.editable) {
    req.user = user;
    return next();
  }

  // 그 외의 경우
  return res.status(403).json({
    message: "Access forbidden, Invalid Token or No right to Edit Post!!!",
  });
};

module.exports = verifyToken;
