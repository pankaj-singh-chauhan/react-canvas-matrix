import { useEffect, useRef, useState } from "react";
import { IProps } from "./CanvasMatrix.utils";
import { drawCircle, drawMultipleSymbols, drawRoundRect, drawTrademark, drawTriangle, setDPI } from "./CanvasMatrix.functions";

export const useDrawCanvas = (props: IProps) => {
  const { gridColumn, gridRows, gridHeight, gridWidth, emptyGrid, multiSymbolIndex } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const totalWidth = gridColumn * gridWidth;
    const totalHeight = gridRows * gridHeight;
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

    /* This is a function that sets the DPI (dots per inch)
    of the canvas to ensure that it is rendered properly on different devices with different pixel
    densities. */
    setDPI(canvas, ctx, totalWidth, totalHeight);

    /* This is clearing the entire canvas by erasing all  the pixels within the specified rectangle. */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid boxes
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColumn; col++) {
        const x = col * gridWidth;
        const y = row * gridHeight;

        const isFirstCol = col === 0;
        const isLastCol = col === gridColumn - 1;

        if (isFirstCol) {
          /* The code is calculating the coordinates and dimensions for drawing a triangle on the canvas. */
          const tSideLength = gridHeight * 0.2;
          const _x = x + gridHeight * 0.3;
          const _y = y + gridHeight - tSideLength;
          drawTriangle(ctx, _x, _y, tSideLength);
        } else if (isLastCol) {
          const _h = gridHeight * 0.45;
          const _x = x + gridHeight * 0.3;
          const _y = y + gridHeight * 0.3;
          drawRoundRect(ctx, _x, _y, _h);
        } else if (allowEmptyGrid && col >= fromCol && col < toCol && row >= fromRow && row < toRow) {
          if (colMultiSymbol === col && rowMultiSymbol === row) {
            drawMultipleSymbols(ctx, x, y, gridHeight, gridWidth);
          }
        } else if (col % 2 === 0) {
          const _r = gridHeight * 0.06;
          const _x = x + gridHeight * 0.3;
          const _y = y + gridHeight * 0.5;
          drawCircle(ctx, _x, _y, _r);
        } else {
          const _r = gridHeight * 0.1;
          const _x = x + gridHeight * 0.3;
          const _y = y + gridHeight * 0.5;
          drawTrademark(ctx, _x, _y, _r);
        }
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, gridWidth, gridHeight);
      }
    }
  }, [gridRows, gridColumn, gridHeight, gridWidth, emptyGrid, multiSymbolIndex]);
  return { canvasRef, zoomScale, setZoomScale };
};
