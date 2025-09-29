// lib/test.ts

const { detectConvergences } = require('./sweetSpotEngine');

const input = {
  weights: { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 },
  keywords: {
    passions: ['design', 'ia'],
    talents: ['design', 'ui'],
    utilite: ['impact', 'education', 'design'],
    viabilite: ['design', 'freelance', 'saas'],
  },
  boostTags: ['design'],
  boostEnabled: true,
};

const result = detectConvergences(input);
console.log(JSON.stringify(result, null, 2));
