import {useEffect, useRef} from "react";

/**
 * Custom hook để polling API theo chu kỳ
 * @param {Function} effectCallback - Callback function để gọi API
 * @param {number} delay - Thời gian delay giữa các lần gọi (ms)
 * @param {Array} deps - Dependencies array, tương tự useEffect
 */
const usePollingEffect = (effectCallback, delay = 3600000, deps = []) => {
  // Default: 1 giờ = 3600000ms
  const savedCallback = useRef();

  // Ghi nhớ callback mới nhất
  useEffect(() => {
    savedCallback.current = effectCallback;
  }, [effectCallback]);

  // Set up the interval
  useEffect(() => {
    // Không polling nếu delay là null hoặc <= 0
    if (!delay || delay <= 0) return;

    const id = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay].concat(deps));
};

export default usePollingEffect;
