import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
type useCFTableSizesParameters = {
  containerSelector: string;
};

const useCFTableSizes = (parameters: useCFTableSizesParameters) => {
  const { containerSelector } = parameters;
  const [containerSize, setContainerSize] = useState(0);

  useEffect(() => {
    setContainerSize(document.querySelector(containerSelector).clientWidth);

    const handleWindowResize = debounce(() => {
      setContainerSize(document.querySelector(containerSelector).clientWidth);
    }, 150);

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [containerSelector]);

  return { containerSize };
};

export default useCFTableSizes;
