// test-sweetspot.ts
import iaService from './components/sweet-spot/services/ia-service';

async function testComplete() {
  const profile = {
    sliderValues: {
      passions: 0.8,
      talents: 0.7,
      utilite: 0.6,
      viabilite: 0.5,
    },
    userKeywords: {
      passions: ['création', 'design', 'innovation'],
      talents: ['programmation', 'analyse', 'créativité'],
      utilite: ['impact social', 'environnement'],
      viabilite: ['tech', 'startup'],
    },
    selectedTags: ['Tech', 'Impact'],
  };

  console.log('🧪 Test 1: Convergences');
  const convergences = await iaService.generateConvergences(profile, {
    cache: true,
    maxResults: 6,
  });
  console.log('✅ Convergences:', convergences);

  console.log('🧪 Test 2: Sweet Spot');
  const sweetSpot = await iaService.detectSweetSpot(profile.userKeywords);
  console.log('✅ Sweet Spot Score:', sweetSpot.score);

  console.log('🧪 Test 3: Projects');
  const projects = await iaService.suggestProjects(convergences);
  console.log('✅ Projects:', projects);
}

testComplete().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
