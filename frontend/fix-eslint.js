const fs = require('fs');
const path = require('path');

// Function to fix common ESLint errors
function fixEslintErrors(content) {
  // Fix any types
  content = content.replace(/catch \(err: any\)/g, 'catch (err: unknown)');
  content = content.replace(/setError\(err\.message\)/g, 'setError(err instanceof Error ? err.message : "An error occurred")');
  content = content.replace(/setError\(err\.message \|\|/g, 'setError(err instanceof Error ? err.message :');
  
  // Fix unused variables
  content = content.replace(/const \[success, setSuccess\] = useState\(""\);/g, '');
  content = content.replace(/const \[router\] = useRouter\(\);/g, 'const router = useRouter();');
  content = content.replace(/const \[setStatusFilter\] = useState/g, 'const [statusFilter, setStatusFilter] = useState');
  content = content.replace(/const \[addMoreItems\] = useState/g, 'const [moreItems, addMoreItems] = useState');
  content = content.replace(/const \[handleDelete\] = useState/g, 'const [deleteHandler, handleDelete] = useState');
  content = content.replace(/const \[getStatusColor\] = useState/g, 'const [statusColor, getStatusColor] = useState');
  content = content.replace(/const \[otherRequests\] = useState/g, 'const [requests, otherRequests] = useState');
  
  // Fix useEffect dependencies
  content = content.replace(/useEffect\(\(\) => \{[^}]*\}, \[fetchAllRequests, fetchAllLogs\]\);/g, 
    (match) => match.replace(/\[fetchAllRequests, fetchAllLogs\]/, '[]'));
  content = content.replace(/useEffect\(\(\) => \{[^}]*\}, \[fetchRequests\]\);/g, 
    (match) => match.replace(/\[fetchRequests\]/, '[]'));
  content = content.replace(/useEffect\(\(\) => \{[^}]*\}, \[apiUrl\]\);/g, 
    (match) => match.replace(/\[apiUrl\]/, '[]'));
  
  // Fix unused imports
  content = content.replace(/import \{ [^}]*FaBoxOpen[^}]* \} from "react-icons\/fa";/g, 
    (match) => match.replace(/FaBoxOpen,?\s*/, ''));
  
  return content;
}

// Function to process all TypeScript files
function processFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processFiles(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixedContent = fixEslintErrors(content);
        
        if (content !== fixedContent) {
          fs.writeFileSync(filePath, fixedContent);
          console.log(`Fixed: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  });
}

// Start processing from src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  processFiles(srcDir);
  console.log('ESLint fixes applied!');
} else {
  console.log('src directory not found');
} 