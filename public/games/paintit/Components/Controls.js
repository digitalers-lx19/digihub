import { Shape } from './Shape.js';
const CONTROLS = [
    { key: 'shape', label: 'figura', tag: 'select', options: Shape.names },
    { key: 'lineWidth', label: 'grosor', type: 'range', min: 1, max: 20, value: 2 },
    { key: 'sides', label: 'lados', type: 'number', min: 3, max: 12, value: 5 },
    { key: 'strokeStyle', label: 'línea', type: 'color', value: '#111111' },
    { key: 'fillStyle', label: 'relleno', type: 'color', value: '#ffffff' },
];
const buildOption = (name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    return option;
};
const buildControl = (spec) => {
    const control = document.createElement(spec.tag ?? 'input');
    control.id = spec.key;
    for (const key of ['type', 'min', 'max']) if (spec[key] !== undefined) control[key] = spec[key];
    if (spec.options) for (const name of spec.options) control.append(buildOption(name));
    control.value = spec.value ?? spec.options?.[0] ?? '';
    return control;
};
export const buildControls = () => CONTROLS.map((spec) => ({ ...spec, control: buildControl(spec) }));
export const bindControls = (painter, controls) => {
    for (const [key, control] of controls) {
        control.addEventListener('input', () => painter.configure({ [key]: control.value }));
        painter.configure({ [key]: control.value });
    }
};
