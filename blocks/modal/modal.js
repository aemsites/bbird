import { loadCSS } from '../../scripts/aem.js';

export default async function getModal(modalId, createContent, addEventListeners) {
  await loadCSS('/blocks/modal/modal.css');

  let dialogElement = document.getElementById(modalId);
  if (!dialogElement) {
    dialogElement = document.createElement('dialog');
    dialogElement.id = modalId;

    const contentHTML = createContent?.() || '';

    dialogElement.innerHTML = `
          <button name="close"><span class="close-x"></span></button>
          ${contentHTML}
      `;

    document.body.appendChild(dialogElement);

    dialogElement.querySelector('button[name="close"]')
      .addEventListener('click', () => {
        dialogElement.close();
      });

    addEventListeners?.(dialogElement);
  }
  return dialogElement;
}
