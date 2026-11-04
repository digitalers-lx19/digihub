export const point = (element, event) => {
    const { left, top } = element.getBoundingClientRect();
    return { x: event.clientX - left, y: event.clientY - top };
};
