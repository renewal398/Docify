'use server';

/**
 * @fileOverview Generates a README file for a given GitHub repository URL.
 *
 * - generateReadmeFromRepo - A function that generates a README file.
 * - GenerateReadmeFromRepoInput - The input type for the generateReadmeFromRepo function.
 * - GenerateReadmeFromRepoOutput - The return type for the generateReadmeFromRepo function.
 */

import {ai} from '@/ai/genkit';
import {getRepoFiles} from '@/ai/tools/get-repo-files';
import {z} from 'genkit';

const GenerateReadmeFromRepoInputSchema = z.object({
  repoLink: z.string().url().describe('The link to the GitHub repository.'),
});
export type GenerateReadmeFromRepoInput = z.infer<
  typeof GenerateReadmeFromRepoInputSchema
>;

const GenerateReadmeFromRepoOutputSchema = z.object({
  readmeContent: z
    .string()
    .describe('The content of the generated README file.'),
});
export type GenerateReadmeFromRepoOutput = z.infer<
  typeof GenerateReadmeFromRepoOutputSchema
>;

export async function generateReadmeFromRepo(
  input: GenerateReadmeFromRepoInput
): Promise<GenerateReadmeFromRepoOutput> {
  return generateReadmeFromRepoFlow(input);
}

const generateReadmePrompt = ai.definePrompt({
  name: 'generateReadmePrompt',
  input: {schema: GenerateReadmeFromRepoInputSchema},
  output: {schema: GenerateReadmeFromRepoOutputSchema},
  tools: [getRepoFiles],
  prompt: `You are an AI expert in generating high-quality README files for GitHub repositories.

  Given the link to a GitHub repository, analyze its structure, code, and purpose, and generate a comprehensive README file.
  Use the getRepoFiles tool to get the content of the repository.
  The README should include:

  - A clear and concise project title.
  - A brief description of the project.
  - Instructions on how to install and run the project.
  - Examples of how to use the project.
  - A list of the project's dependencies.
  - Information on how to contribute to the project.
  - A license notice.

  Consider common sense rules and information found online about similar code patterns to create an informative, high-quality document.

  Repository Link: {{{repoLink}}}
  `,
});

const generateReadmeFromRepoFlow = ai.defineFlow(
  {
    name: 'generateReadmeFromRepoFlow',
    inputSchema: GenerateReadmeFromRepoInputSchema,
    outputSchema: GenerateReadmeFromRepoOutputSchema,
  },
  async input => {
    const {output} = await generateReadmePrompt(input);
    return output!;
  }
);
