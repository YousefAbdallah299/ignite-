import fs from 'fs';
import path from 'path';

// Check if source API routes exist
if (fs.existsSync('src/app/api')) {
  // Create the target directory structure
  fs.mkdirSync('build/server/src/app', { recursive: true });
  
  // Copy API routes
  fs.cpSync('src/app/api', 'build/server/src/app/api', { recursive: true });
  
  console.log('✅ API routes copied successfully to build directory');
} else {
  console.log('⚠️  Source API routes not found at src/app/api');
}
