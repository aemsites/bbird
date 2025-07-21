import { createOptimizedPicture } from '../../scripts/aem.js';
import { processInChunks } from '../../scripts/utils.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  const rows = [...block.children];

  // Process rows in chunks to avoid blocking the main thread
  await processInChunks(rows, (row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  }, { chunkSize: 3, priority: 'user-visible' });

  // Process images in chunks to avoid blocking
  const images = ul.querySelectorAll('picture > img');
  await processInChunks([...images], (img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  }, { chunkSize: 2, priority: 'background' });

  block.textContent = '';
  block.append(ul);
}
