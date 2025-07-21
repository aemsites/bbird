/**
 * Creates a new HTML element
 */
export default function createElement(tagName, attributes, ...children) {
  const el = document.createElement(tagName);
  if (attributes) {
    Object.keys(attributes).forEach((name) => {
      el.setAttribute(name, attributes[name]);
    });
  }
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (Array.isArray(child)) {
      child.forEach((c) => el.appendChild(c));
    } else if (child) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Schedules a task using the most appropriate scheduling method available
 * Prioritizes scheduler.postTask > requestIdleCallback > requestAnimationFrame > setTimeout
 * @param {Function} task - The task to execute
 * @param {Object} options - Scheduling options
 * @param {string} options.priority - Task priority ('user-blocking', 'user-visible', 'background')
 * @param {number} options.timeout - Timeout for idle callback
 * @returns {Promise} Promise that resolves when the task completes
 */
export function scheduleTask(task, options = {}) {
  const {
    priority = 'background',
    timeout = 5000,
  } = options;

  return new Promise((resolve) => {
    // Use scheduler.postTask if available (Chrome 94+)
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      window.scheduler.postTask(() => {
        const result = task();
        resolve(result);
      }, { priority });
      return;
    }

    // Fallback to requestIdleCallback for background tasks
    if (priority === 'background' && 'requestIdleCallback' in window) {
      requestIdleCallback((deadline) => {
        const result = task(deadline);
        resolve(result);
      }, { timeout });
      return;
    }

    // Use requestAnimationFrame for visible tasks
    if (priority !== 'background' && 'requestAnimationFrame' in window) {
      requestAnimationFrame(() => {
        const result = task();
        resolve(result);
      });
      return;
    }

    // Final fallback to setTimeout
    setTimeout(() => {
      const result = task();
      resolve(result);
    }, 0);
  });
}

/**
 * Processes an array in chunks to avoid blocking the main thread
 * @param {Array} items - Array to process
 * @param {Function} processor - Function to process each item
 * @param {Object} options - Processing options
 * @param {number} options.chunkSize - Items to process per chunk (default: 5)
 * @param {string} options.priority - Task priority for scheduling
 * @returns {Promise} Promise that resolves when all items are processed
 */
export async function processInChunks(items, processor, options = {}) {
  const {
    chunkSize = 5,
    priority = 'background',
  } = options;

  const chunks = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  // Process chunks sequentially to maintain order
  // eslint-disable-next-line no-restricted-syntax
  await chunks.reduce(async (previousPromise, chunk) => {
    await previousPromise;
    return scheduleTask(() => {
      chunk.forEach(processor);
    }, { priority });
  }, Promise.resolve());
}

/**
 * Defers execution to the next idle period or frame
 * @param {Function} callback - Function to execute
 * @param {string} priority - Execution priority
 * @returns {Promise} Promise that resolves when callback completes
 */
export function defer(callback, priority = 'background') {
  return scheduleTask(callback, { priority });
}
