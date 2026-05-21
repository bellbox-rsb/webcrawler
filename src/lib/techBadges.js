export const techBadges = {
  'node.js': 'https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white',
  'react': 'https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB',
  'vue.js': 'https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D',
  'next.js': 'https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white',
  'nuxt.js': 'https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white',
  'angular': 'https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white',
  'svelte': 'https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white',
  'tailwind css': 'https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white',
  'bootstrap': 'https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white',
  'jquery': 'https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white',
  'wordpress': 'https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=white',
  'php': 'https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white',
  'cloudflare': 'https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white',
  'nginx': 'https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white',
  'apache': 'https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white'
};

export function getTechBadgeUrl(techName) {
  const cleanName = techName.toLowerCase().trim();
  if (techBadges[cleanName]) {
    return techBadges[cleanName];
  }
  // Dynamic fallback badge for other detected tech
  return `https://img.shields.io/badge/${encodeURIComponent(techName)}-4F46E5?style=for-the-badge&logo=cpu&logoColor=white`;
}
