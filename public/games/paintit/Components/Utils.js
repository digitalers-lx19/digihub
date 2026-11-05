const toNumberList = (values) => {
    const numbers = values.map(Number);
    return numbers.every(Number.isFinite) ? numbers : null;
};
const reduce = (op, startValue = null) => (...values) =>
    toNumberList(values)?.reduce((res, v) => 
        res === null ? v : op(res, v), startValue) ?? 0;
const addition = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export const sum = reduce(addition, 0);
export const diff = reduce(subtract);
export const prod = reduce(multiply, 1);
export const div = reduce(divide);
export const center = (a, b) => addition(a, b) / 2;
export const distance = (a, b) => Math.abs(diff(a, b));
export const length = (x1, y1, x2, y2) => Math.hypot(distance(x1, x2), distance(y1, y2));