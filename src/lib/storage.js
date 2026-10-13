// 浏览器存储在隐私模式或被禁用时可能抛错，所有读写都需降级处理
function getStore(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  get(kind, key) {
    try {
      return getStore(kind)?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(kind, key, value) {
    try {
      getStore(kind)?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};
