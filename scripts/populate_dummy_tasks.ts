import { todoApi } from '../src/services/todoApi';

async function addDummyTask(title: string, deadline: string) {
  try {
    await todoApi.createTodo({
      title: `Sample Task - ${title}`,
      description: 'This is a dummy task for analytics testing',
      deadline: new Date(`${deadline}T23:59:00`).toISOString(),
    });
    console.log(`✅ Added task for ${deadline}`);
  } catch (error) {
    console.error(`❌ Failed to add task for ${deadline}:`, error);
  }
}

async function populateDummyTasks() {
  const dates = [
    '2025-02-12',
    '2025-02-26',
    '2025-03-12',
    '2025-03-26',
    '2025-04-09',
    '2025-04-23',
    '2025-05-07'
  ];

  console.log('🚀 Starting to populate dummy tasks...');

  // Add 5 tasks for each date to ensure we have enough data
  for (const date of dates) {
    for (let i = 1; i <= 5; i++) {
      await addDummyTask(`${i} for ${date}`, date);
      // Add a small delay between requests to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('✨ Finished populating dummy tasks!');
}

// Run the population script
populateDummyTasks().catch(console.error); 