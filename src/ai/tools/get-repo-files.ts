'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RepoFilesSchema = z.record(z.string());
type RepoFiles = z.infer<typeof RepoFilesSchema>;

async function getRepoContents(
  owner: string,
  repo: string,
  path = ''
): Promise<RepoFiles> {
  let files: RepoFiles = {};
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const contents = await response.json();

  for (const item of contents) {
    if (item.type === 'file') {
      const fileResponse = await fetch(item.download_url);
      if (fileResponse.ok) {
        // Only include files smaller than 1MB
        if (Number(item.size) < 1000000) {
          files[item.path] = await fileResponse.text();
        }
      }
    } else if (item.type === 'dir') {
      const subFiles = await getRepoContents(owner, repo, item.path);
      files = {...files, ...subFiles};
    }
  }

  return files;
}

export const getRepoFiles = ai.defineTool(
  {
    name: 'getRepoFiles',
    description: 'Fetches the file contents of a given GitHub repository.',
    inputSchema: z.object({
      repoLink: z.string().url().describe('The URL of the GitHub repository.'),
    }),
    outputSchema: RepoFilesSchema,
  },
  async input => {
    const url = new URL(input.repoLink);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL.');
    }
    const [owner, repo] = pathParts;
    return getRepoContents(owner, repo);
  }
);
