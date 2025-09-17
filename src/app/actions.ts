'use server';

import { generateReadmeFromRepo, GenerateReadmeFromRepoOutput } from '@/ai/flows/generate-readme-from-repo';

type ActionResult = {
  data?: GenerateReadmeFromRepoOutput;
  error?: string;
}

export async function generateReadmeAction(repoUrl: string): Promise<ActionResult> {
  if (!repoUrl || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(repoUrl)) {
      return { error: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo).' };
  }
  
  try {
    const result = await generateReadmeFromRepo({ repoLink: repoUrl });
    if (!result.readmeContent) {
      return { error: 'The AI could not generate a README. The repository might be empty or inaccessible.' };
    }
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while generating the README. Please try again later.' };
  }
}
