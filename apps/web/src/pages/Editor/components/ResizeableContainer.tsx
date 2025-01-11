// import React, { useState, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react';

// interface ResizableContainerProps {
//   initialWidth: number;
//   initialHeight: number;
// }

// const ResizableContainer: React.FC<ResizableContainerProps> = ({ initialWidth, initialHeight }) => {
//   // State to track the container's width and height
//   const [size, setSize] = useState<{ width: number; height: number }>({
//     width: initialWidth,
//     height: initialHeight,
//   });

//   const containerRef = useRef<HTMLDivElement | null>(null);

//   const startResize = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
//     // Store the initial mouse position and size when the drag starts
//     const startX = e.clientX;
//     const startY = e.clientY;
//     const startWidth = size.width;
//     const startHeight = size.height;

//     const doResize = (moveEvent: MouseEvent) => {
//       const dx = moveEvent.clientX - startX;
//       const dy = moveEvent.clientY - startY;

//       setSize({
//         width: startWidth + dx,
//         height: startHeight + dy,
//       });
//     };

//     const stopResize = () => {
//       document.removeEventListener('mousemove', doResize);
//       document.removeEventListener('mouseup', stopResize);
//     };

//     // Attach event listeners for resizing
//     document.addEventListener('mousemove', doResize as EventListener);
//     document.addEventListener('mouseup', stopResize);
//   }, [size]);

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: `${size.width}px`,
//         height: `${size.height}px`,
//         position: 'relative',
//       }}
//     >
//       {/* Resizable handle at the bottom-right corner */}
//       <div
//         onMouseDown={startResize}
//         style={{
//           position: 'absolute',
//           bottom: 0,
//           right: 0,
//           cursor: 'se-resize',
//           width: '10px',
//           height: '10px',
//         }}
//       />
//     </div>
//   );
// };

// export default ResizableContainer;
