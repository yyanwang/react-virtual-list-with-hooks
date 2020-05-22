import React, { useState, useRef, useEffect } from "react";

function MyVirtualizedList(props) {
  const { height, items, children, estimatedItemHeight } = props;
  const [scrollTop, setScrollTop] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const dataRef = useRef({
    cache: {},
    lastIndex: -1
  });

  const list = useRef(null);

  useEffect(() => {
    const data = dataRef.current;
    const nodes = list.current.childNodes;
    let offset = 0;
    if (startIndex > 0) {
      const lastItemCache = data.cache[startIndex - 1];
      if (lastItemCache) {
        offset = lastItemCache.offset + lastItemCache.height;
      }
    }
    nodes.forEach((node, idx) => {
      const nodeCache = data.cache[startIndex + idx];
      let itemHeight;
      if (!nodeCache) {
        itemHeight = node.getBoundingClientRect().height;
        data.cache[startIndex + idx] = {
          offset,
          height: itemHeight
        };
        offset += itemHeight;
        data.lastIndex = startIndex + idx;
      } else {
        offset = nodeCache.offset + nodeCache.height;
      }
    });
  }, [startIndex, endIndex]);
  useEffect(() => {
    setStartIndex(findNearestItem(scrollTop));
    setEndIndex(findNearestItem(scrollTop + height));
  }, [scrollTop, height]);
  function handleScroll(event) {
    setScrollTop(event.target.scrollTop);
  }

  function computeHeight() {
    const cachedHeight = Object.keys(dataRef.current.cache).reduce(
      (result, idx) => result + dataRef.current.cache[idx].height,
      0
    );
    const unCachedCount =
      items.length - Object.keys(dataRef.current.cache).length;
    return cachedHeight + estimatedItemHeight * unCachedCount;
  }
  function binarySearch(low, high, offset) {
    let index;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const middleOffset = dataRef.current.cache[middle].offset;
      if (middleOffset === offset) {
        index = middle;
        break;
      } else if (middleOffset > offset) {
        high = middle - 1;
      } else {
        low = middle + 1;
      }
    }

    if (low > 0) {
      index = low - 1;
    }

    if (typeof index === "undefined") {
      index = 0;
    }

    return index;
  }
  function findNearestItem(offset) {
    const data = dataRef.current;
    let lastOffset = 0;
    if (data.lastIndex >= 0) {
      const lastMeasured = data.cache[data.lastIndex];
      if (lastMeasured) {
        lastOffset = lastMeasured.offset + lastMeasured.height;
      }
    }
    if (offset <= lastOffset) {
      return binarySearch(0, data.lastIndex, offset);
    } else {
      for (let i = data.lastIndex + 1; i <= items.length; i++) {
        lastOffset += estimatedItemHeight;
        if (lastOffset >= offset) {
          return i;
        }
      }
    }
  }

  return (
    <div
      className="list-view"
      style={{
        height
      }}
      onScroll={handleScroll}
    >
      <div
        className="list-view-phantom"
        style={{
          height: computeHeight()
        }}
      />
      <div className="list-view-content" style={{ top: scrollTop }} ref={list}>
        {items.slice(startIndex, endIndex).map((item, index) => {
          return children({
            index,
            item
          });
        })}
      </div>
    </div>
  );
}

export default MyVirtualizedList;
