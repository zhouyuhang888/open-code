const app = getApp();

const login = () => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: res => {
        app.globalData.userInfo = res.userInfo;
        wx.cloud.callFunction({
          name: 'login',
          success: loginRes => {
            app.globalData.openid = loginRes.result.openid;
            resolve(loginRes.result);
          },
          fail: err => reject(err)
        });
      },
      fail: err => reject(err)
    });
  });
};

const checkLogin = () => {
  return new Promise((resolve) => {
    if (app.globalData.openid) {
      resolve(true);
      return;
    }
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        if (res.result && res.result.openid) {
          app.globalData.openid = res.result.openid;
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: () => resolve(false)
    });
  });
};

module.exports = {
  login,
  checkLogin
};
