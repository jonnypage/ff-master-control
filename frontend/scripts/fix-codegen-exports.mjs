import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'src/lib/graphql/generated/index.ts';

try {
  let content = readFileSync(indexPath, 'utf8');
  
  // Check if the export already exists
  if (!content.includes('export * from "./graphql"')) {
    // Add the export if it doesn't exist
    content += '\nexport * from "./graphql";\n';
    writeFileSync(indexPath, content);
    console.log('✓ Added export * from "./graphql" to index.ts');
  } else {
    console.log('✓ Export already exists in index.ts');
  }
} catch (error) {
  console.error('Error fixing exports:', error);
  process.exit(1);
}


