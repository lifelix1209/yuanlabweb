// Hero 粒子场的单例引用，供开屏动画读取弧线坐标以实现无缝衔接
let current = null;

export const heroRegistry = {
  set(field) {
    current = field;
  },
  clear(field) {
    if (current === field) current = null;
  },
  get() {
    return current;
  },
};
