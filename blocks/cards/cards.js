import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else if (div.querySelector('a') || div.querySelector('button')) div.className = 'cards-card-button';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  
  // Add button functionality
  ul.querySelectorAll('.cards-card-button a, .cards-card-button button').forEach((button) => {
    if (button.tagName === 'A') {
      button.className = 'cards-button cards-button--link';
    } else if (button.tagName === 'BUTTON') {
      button.className = 'cards-button cards-button--button';
    }
  });
  
  block.textContent = '';
  block.append(ul);
}
