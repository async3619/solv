import { HTMLElement } from "node-html-parser";

export function findSiblingElement(root: HTMLElement, checkCallback: (target: HTMLElement) => boolean) {
    let currentElement: HTMLElement | null = root;
    while (true) {
        if (!currentElement) {
            return null;
        }

        if (checkCallback(currentElement)) {
            return currentElement;
        }

        currentElement = currentElement.nextElementSibling;
    }
}
