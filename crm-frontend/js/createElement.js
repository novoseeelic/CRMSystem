export const createElement = (tag, classNames = [], attributes = {}) => {
    const element = document.createElement(tag);
    classNames.forEach(className => element.classList.add(className));
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    return element;
};