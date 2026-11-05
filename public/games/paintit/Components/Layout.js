const HORIZONTAL_MARGIN = 0;
const VERTICAL_MARGIN = 0;
export const getCanvasSize = () => {
    const stage = document.getElementById('stage');
    const stageTop = stage?.getBoundingClientRect().top ?? 0;
    return {
        width: Math.max(1, window.innerWidth - HORIZONTAL_MARGIN),
        height: Math.max(1, window.innerHeight - stageTop - VERTICAL_MARGIN),
    };
};
export const fitToWindow = (painter, preview) => {
    const { width, height } = getCanvasSize();
    painter.resize(width, height);
    preview.resize(width, height);
};
