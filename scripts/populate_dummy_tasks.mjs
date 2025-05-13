async function addDummyTask(title, deadline, status = 'ongoing') {
  try {
    const response = await fetch('http://localhost:8000/api/todos/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Sample Task - ${title}`,
        description: 'This is a dummy task for analytics testing',
        deadline: new Date(`${deadline}T23:59:00`).toISOString(),
        status: status
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`✅ Added task for ${deadline} with status ${status}`);
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

  // Distribution of task statuses for each date
  for (const date of dates) {
    // Add successful tasks (20-30%)
    const successCount = Math.floor(Math.random() * 2) + 2; // 2-3 successful tasks
    for (let i = 1; i <= successCount; i++) {
      await addDummyTask(`Success ${i} for ${date}`, date, 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Add failed tasks (50-60%)
    const failedCount = Math.floor(Math.random() * 2) + 5; // 5-6 failed tasks
    for (let i = 1; i <= failedCount; i++) {
      await addDummyTask(`Failed ${i} for ${date}`, date, 'failure');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Add ongoing tasks (10-20%)
    const ongoingCount = Math.floor(Math.random() * 2) + 1; // 1-2 ongoing tasks
    for (let i = 1; i <= ongoingCount; i++) {
      await addDummyTask(`Ongoing ${i} for ${date}`, date, 'ongoing');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('✨ Finished populating dummy tasks!');
}

// Run the population script
populateDummyTasks().catch(console.error); 