import { FormEventHandler, MutableRefObject, PointerEvent, useLayoutEffect, useRef, useState } from "react";
import {
  drawCircle,
  drawMultipleSymbols,
  drawRegisteredTrademark,
  drawRoundRect,
  drawTriangle,
  setDPI,
} from "./CanvasMatrix.functions";
import { IProps, TAxis } from "./CanvasMatrix.utils";

export const useDrawCanvas = (props: IProps, canvasRef: MutableRefObject<HTMLCanvasElement>, scale: number) => {
  const { gridColumn, gridRows, gridHeight, gridWidth, emptyGrid, multiSymbolIndex } = props;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaledGridWidth = gridWidth * scale;
    const scaledGridHeight = gridHeight * scale;

    const totalWidth = gridColumn * scaledGridWidth;
    const totalHeight = gridRows * scaledGridHeight;

    const allowEmptyGrid = gridColumn > 2 && gridRows > 0;
    const defaultEndRow = Math.min(gridRows - 1, 2);
    const defaultEndCol = gridColumn - 1;

    let colMultiSymbol = multiSymbolIndex?.col ?? 1;
    let rowMultiSymbol = multiSymbolIndex?.row ?? 0;

    let fromRow = emptyGrid?.fromRow ?? 0;
    let toRow = emptyGrid?.toRow ?? defaultEndRow;

    if (fromRow > toRow) fromRow = 0;
    if (toRow < fromRow) toRow = fromRow;

    let fromCol = emptyGrid?.fromCol ?? 1;
    let toCol = emptyGrid?.toCol ?? defaultEndCol;

    if (fromCol > toCol) fromCol = 1;
    if (toCol < fromCol) toCol = fromCol;

    if (colMultiSymbol < fromCol) colMultiSymbol = fromCol;
    if (colMultiSymbol >= toCol) colMultiSymbol = fromCol;

    if (rowMultiSymbol < fromRow) rowMultiSymbol = fromRow;
    if (rowMultiSymbol >= toRow) rowMultiSymbol = fromRow;

    setDPI(canvas, ctx, totalWidth, totalHeight);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColumn; col++) {
        const x = col * scaledGridWidth;
        const y = row * scaledGridHeight;

        const isFirstCol = col === 0;
        const isLastCol = col === gridColumn - 1;

        if (isFirstCol) {
          const tSideLength = scaledGridHeight * 0.2;
          const _x = x + scaledGridWidth * 0.3;
          const _y = y + scaledGridHeight - tSideLength;
          drawTriangle(ctx, _x, _y, tSideLength);
        } else if (isLastCol) {
          const _h = scaledGridHeight * 0.45;
          const _x = x + scaledGridWidth * 0.37;
          const _y = y + scaledGridHeight * 0.3;
          drawRoundRect(ctx, _x, _y, _h);
        } else if (allowEmptyGrid && col >= fromCol && col < toCol && row >= fromRow && row < toRow) {
          if (colMultiSymbol === col && rowMultiSymbol === row) {
            drawMultipleSymbols(ctx, x, y, scaledGridHeight, scaledGridWidth);
          }
        } else if (col % 2 === 0) {
          const _r = scaledGridHeight * 0.06;
          const _x = x + scaledGridWidth * 0.3;
          const _y = y + scaledGridHeight * 0.5;
          drawCircle(ctx, _x, _y, _r);
        } else {
          const _r = scaledGridHeight * 0.1;
          const _x = x + scaledGridWidth * 0.3;
          const _y = y + scaledGridHeight * 0.5;
          drawRegisteredTrademark(ctx, _x, _y, _r);
        }
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, scaledGridWidth, scaledGridHeight);
      }
    }
  }, [gridRows, gridColumn, gridHeight, gridWidth, emptyGrid, multiSymbolIndex, scale, canvasRef]);
};

export const usePanAndZoom = (canvasRef: MutableRefObject<HTMLCanvasElement>) => {
  const [scale, setScale] = useState<number>(1);

  const panGesture = useRef({ xStart: 0, yStart: 0, isPanning: false });
  const panOffset = useRef<TAxis>({ x: 0, y: 0 });

  const onPanStart = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const { pointerId, clientX, clientY } = event;

    canvasRef.current.setPointerCapture(pointerId);
    panGesture.current.xStart = clientX;
    panGesture.current.yStart = clientY;
    panGesture.current.isPanning = true;
    canvasRef.current.style.cursor = "grabbing";
  };

  const onPanActive = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!panGesture.current.isPanning) return;
    const { clientX, clientY } = event;

    const deltaX = clientX - panGesture.current.xStart;
    const deltaY = clientY - panGesture.current.yStart;

    panGesture.current.xStart = clientX;
    panGesture.current.yStart = clientY;

    const newX = panOffset.current.x + deltaX;
    const newY = panOffset.current.y + deltaY;
    panOffset.current.x = newX;
    panOffset.current.y = newY;
    canvasRef.current.style.translate = `${newX}px ${newY}px`;
  };

  const onPanEnd = () => {
    panGesture.current.isPanning = false;
    canvasRef.current.style.cursor = "grab";
  };

  const onScaleChange: FormEventHandler<HTMLInputElement> = (e) => {
    setScale(Number(e.currentTarget.value));
  };

  return { scale, onScaleChange, onPanStart, onPanActive, onPanEnd };
};
