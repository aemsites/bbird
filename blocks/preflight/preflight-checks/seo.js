/* eslint-disable max-len */

export default () => {
  const results = [];

  // H1 Check
  const h1s = document.querySelectorAll('h1');
  results.push({
    icon: h1s.length === 1 ? 'green' : 'red',
    title: 'H1 Check',
    description: h1s.length === 1 ? 'Good: One H1 found' : `Error: Found ${h1s.length} H1 tags`,
  });

  // Title Check
  const titleSize = document.title.replace(/\s/g, '').length;
  results.push({
    icon: (titleSize >= 15 && titleSize <= 70) ? 'green' : 'red',
    title: 'Title Length',
    description: (titleSize >= 15 && titleSize <= 70) ? 'Good: Title length is optimal' : 'Error: Title should be 15-70 characters',
  });

  // Meta Description Check
  const metaDesc = document.querySelector('meta[name="description"]');
  const descSize = metaDesc?.content.replace(/\s/g, '').length || 0;
  results.push({
    icon: (descSize >= 50 && descSize <= 150) ? 'green' : 'red',
    title: 'Meta Description',
    description: (descSize >= 50 && descSize <= 150) ? 'Good: Meta description length is optimal' : 'Error: Meta description should be 50-150 characters',
  });

  // Body Content Check
  const bodyText = document.body.textContent.replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').length;
  results.push({
    icon: wordCount >= 300 ? 'green' : 'red',
    title: 'Content Length',
    description: wordCount >= 300 ? `Good: Content length (${wordCount} words)` : `Warning: Content length (${wordCount} words) is less than recommended 300 words`,
  });

  // Lorem Ipsum Check
  const hasLorem = bodyText.toLowerCase().includes('lorem ipsum');
  results.push({
    icon: !hasLorem ? 'green' : 'red',
    title: 'Lorem Ipsum Check',
    description: !hasLorem ? 'Good: No Lorem Ipsum found' : 'Error: Lorem Ipsum text detected',
  });

  return results;
};
