import { processInChunks } from '../../scripts/utils.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Setup image columns with chunked processing
  const rows = [...block.children];
  await processInChunks(rows, (row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  }, { chunkSize: 3, priority: 'user-visible' });
}
