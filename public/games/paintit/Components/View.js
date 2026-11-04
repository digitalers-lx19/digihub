import { buildControls } from './Controls.js';
const buildLabel = (text, control) => {
    const label = document.createElement('label');
    label.append(text, control);
    return label;
};
export const View = (root = document.getElementById('root') ?? document.body) => {
    const toolbar = document.createElement('section');
    toolbar.id = 'container';
    const built = buildControls();
    const controls = new Map();
    for (const { key, label, control } of built) {
        toolbar.append(buildLabel(label, control));
        controls.set(key, control);
    }
    const stage = document.createElement('div');
    stage.id = 'stage';
    const preview = document.createElement('canvas');
    preview.id = 'shadow';
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    stage.append(preview, canvas);
    root.append(toolbar, stage);
    return { canvas, preview, controls };
};
