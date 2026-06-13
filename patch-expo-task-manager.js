const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, 'node_modules', 'expo-task-manager', 'android', 'src', 'main', 'java', 'expo', 'modules', 'taskManager', 'TaskManagerUtils.java'),
  path.join(__dirname, 'mobile-app', 'driver-app', 'node_modules', 'expo-task-manager', 'android', 'src', 'main', 'java', 'expo', 'modules', 'taskManager', 'TaskManagerUtils.java')
];

for (const filePath of filePaths) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the signature
    content = content.replace(
      /public void executeTask\(TaskInterface task, Bundle data, @Nullable TaskExecutionCallback callback\) {/g,
      'public void executeTask(TaskInterface task, Bundle data) {'
    );
    
    // Replace the method body
    content = content.replace(
      /task\.execute\(data, null, callback\);/g,
      'task.execute(data, null);'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully patched ${filePath}`);
  }
}
