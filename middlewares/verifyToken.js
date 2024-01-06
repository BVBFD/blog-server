const jwt = require("jsonwebtoken");
const tokenDatasModel = require("../models/tokenDatasModel"); // tokenDatasModel을 가져와야 합니다.

const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log(accessToken);
    console.log(refreshToken);

    let user;
    try {
      // accessToken 검증
      user = jwt.verify(accessToken, "lsevina126jwtsecretkey");
    } catch (error) {
      // accessToken 유효기간 혹은 쿠키기간 만료시 에러
      // refreshToken 담는 cookie가 만료되었을 경우
      if (refreshToken === undefined) {
        await tokenDatasModel.findOneAndDelete({
          userId: req.body.userId,
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
        jwt.verify(storedToken.refreshToken, "lsevina126jwtsecretkey");
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
          { userId: storedToken.userId },
          "lsevina126jwtsecretkey",
          { expiresIn: "3s" } // 수정: expiresIn을 적절한 값으로 변경
        );
        const newRefreshToken = jwt.sign(
          { userId: storedToken.userId },
          "lsevina126jwtsecretkey",
          {
            expiresIn: "4s",
          }
        );

        // mongodb 업데이트
        await tokenDatasModel.findOneAndUpdate(
          { accessToken },
          {
            $set: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          }
        );

        // cookie도 업데이트
        res.cookie(
          "token",
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          { httpOnly: true }
        );

        // refresh 토근 검증 통과 그리고 새로운 accessToken, refreshToken 발급받고 다음 로직으로 넘어간다.
        req.user = { userId: storedToken.userId };
        return next();
      }
    }

    // Access Token이 유효한 경우
    if (user.userId) {
      req.user = user;
      return next();
    }

    // 그 외의 경우
    return res.status(403).json({ message: "Access forbidden, invalid token" });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = verifyToken;
