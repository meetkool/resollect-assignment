// Node.js 18+ has native fetch
const API_URL = 'http://localhost:8000/api';
// Generate a date object for a relative deadline (e.g., +1 day, -2 hours)
function getRelativeDate(days = 0, hours = 0, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}
// Sample tasks with various deadlines
const sampleTasks = [
  // Ongoing tasks (future deadlines)
  {
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the current project",
    deadline: getRelativeDate(3), // 3 days from now
    status: "ongoing"
  },
  {
    title: "Prepare presentation slides",
    description: "Create slides for the upcoming client meeting",
    deadline: getRelativeDate(1, 2), // 1 day and 2 hours from now
    status: "ongoing"
  },
  {
    title: "Review pull requests",
    description: "Check and review open PRs from the development team",
    deadline: getRelativeDate(0, 3), // 3 hours from now
    status: "ongoing"
  },
  {
    title: "Send weekly report",
    description: "Compile and send the weekly progress report to the manager",
    deadline: getRelativeDate(0, 1, 30), // 1 hour 30 minutes from now
    status: "ongoing"
  },
  // Completed tasks (set as success regardless of deadline)
  {
    title: "Fix login bug",
    description: "Resolve the authentication issue reported by users",
    deadline: getRelativeDate(-1), // 1 day ago
    status: "success"
  },
  {
    title: "Update dependencies",
    description: "Update project dependencies to the latest versions",
    deadline: getRelativeDate(2), // 2 days from now (completed early)
    status: "success"
  },
  // Failed tasks (past deadlines, marked as failures)
  {
    title: "Submit expense report",
    description: "Complete and submit the monthly expense report",
    deadline: getRelativeDate(-2), // 2 days ago
    status: "failure"
  },
  {
    title: "Complete code review",
    description: "Review the code for the new feature implementation",
    deadline: getRelativeDate(-1, -4), // 1 day 4 hours ago
    status: "failure"
  },
  // Tasks that will expire soon (for testing expiration)
  {
    title: "URGENT: Deploy hotfix",
    description: "Deploy critical bugfix to production",
    deadline: getRelativeDate(0, 0, 10), // 10 minutes from now
    status: "ongoing"
  },
  {
    title: "Call client about project extension",
    description: "Discuss project timeline extension with the client",
    deadline: getRelativeDate(0, 0, 15), // 15 minutes from now
    status: "ongoing"
  }
];
// Function to add a task to the application
async function addTask(task) {
  try {
    const response = await fetch(`${API_URL}/todos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to create task: ${task.title}`);
    }
    const data = await response.json();
    console.log(`✅ Created task: ${task.title} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error(`❌ Error creating task: ${task.title}`, error.message);
    return null;
  }
}
// Main function to add all sample tasks
async function addSampleTasks() {
  console.log('🚀 Starting task generation...');
  console.log(`📋 Adding ${sampleTasks.length} sample tasks to the application`);
  // Add tasks sequentially to maintain order and prevent rate limiting
  for (const task of sampleTasks) {
    await addTask(task);
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log('✨ Task generation completed!');
}
// Run the task generator
addSampleTasks().catch(error => {
  console.error('Failed to generate tasks:', error);
  process.exit(1);
}); 