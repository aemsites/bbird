export default function decorate(block) {
  // Optimize hero images for LCP
  const heroImages = block.querySelectorAll('img');
  heroImages.forEach((img) => {
    // Hero images should be eager loaded with high fetch priority for LCP optimization
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  });
}
