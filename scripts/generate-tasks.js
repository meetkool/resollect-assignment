const fetch = require('node-fetch');
const API_URL = 'http://localhost:8000/api';
function getRelativeDate(days = 0, hours = 0, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}
const sampleTasks = [
  {
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the current project",
    deadline: getRelativeDate(3),
    status: "ongoing"
  },
  {
    title: "Prepare presentation slides",
    description: "Create slides for the upcoming client meeting",
    deadline: getRelativeDate(1, 2),
    status: "ongoing"
  },
  {
    title: "Review pull requests",
    description: "Check and review open PRs from the development team",
    deadline: getRelativeDate(0, 3),
    status: "ongoing"
  },
  {
    title: "Send weekly report",
    description: "Compile and send the weekly progress report to the manager",
    deadline: getRelativeDate(0, 1, 30),
    status: "ongoing"
  },
  {
    title: "Fix login bug",
    description: "Resolve the authentication issue reported by users",
    deadline: getRelativeDate(-1),
    status: "success"
  },
  {
    title: "Update dependencies",
    description: "Update project dependencies to the latest versions",
    deadline: getRelativeDate(2), 
    status: "success"
  },
  
  {
    title: "Submit expense report",
    description: "Complete and submit the monthly expense report",
    deadline: getRelativeDate(-2), 
    status: "failure"
  },
  {
    title: "Complete code review",
    description: "Review the code for the new feature implementation",
    deadline: getRelativeDate(-1, -4),
    status: "failure"
  },
  {
    title: "URGENT: Deploy hotfix",
    description: "Deploy critical bugfix to production",
    deadline: getRelativeDate(0, 0, 10), 
    status: "ongoing"
  },
  {
    title: "Call client about project extension",
    description: "Discuss project timeline extension with the client",
    deadline: getRelativeDate(0, 0, 15), 
    status: "ongoing"
  }
];
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
async function addSampleTasks() {
  console.log('🚀 Starting task generation...');
  console.log(`📋 Adding ${sampleTasks.length} sample tasks to the application`);
  for (const task of sampleTasks) {
    await addTask(task);
  }
  console.log('✨ Task generation completed!');
}
addSampleTasks().catch(error => {
  console.error('Failed to generate tasks:', error);
  process.exit(1);
}); 