import { useEffect, useRef, useCallback } from "react";

export const useInfiniteScroll = (onIntersect, hasMore, loading) => {
  const observerRef = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onIntersect();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onIntersect]
  );

  return lastElementRef;
};
