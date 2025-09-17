import { config } from 'dotenv';
config();

import '@/ai/flows/generate-readme-from-repo.ts';
import '@/ai/tools/get-repo-files.ts';
