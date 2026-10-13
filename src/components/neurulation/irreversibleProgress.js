import { clamp } from '../hero/neuralCrestGeometry';

// 单向不可逆：只记录到达过的最远进度，往回滚动不倒放
export const advance = (reached, incoming) => Math.max(reached, clamp(incoming));

// 回到页面顶部时重置
export const shouldReset = (scrollTop, threshold = 2) => scrollTop <= threshold;
