"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wand2, Copy, Download, Loader2, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateReadmeAction } from "./actions";

const formSchema = z.object({
  repoUrl: z.string().url({ message: "Please enter a valid URL." }).regex(/^https:\/\/github\.com\/[^/]+\/[^/]+(\/)?$/, {
    message: "Please enter a valid GitHub repository URL."
  }),
});

export default function Home() {
  const [readmeContent, setReadmeContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReadmeContent("");
    
    const result = await generateReadmeAction(values.repoUrl);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    } else if (result.data) {
      setReadmeContent(result.data.readmeContent);
    }
    
    setIsLoading(false);
  }

  const handleCopy = () => {
    if (!readmeContent) return;
    navigator.clipboard.writeText(readmeContent);
    toast({
      title: "Copied to Clipboard!",
      description: "You can now paste the README content.",
    });
  };

  const handleDownload = () => {
    if (!readmeContent) return;
    const blob = new Blob([readmeContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Docify
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Instantly generate production-ready READMEs for your GitHub repositories with AI.
          </p>
        </div>

        <Card className="w-full border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Github />
              Repository Link
            </CardTitle>
            <CardDescription>
              Enter the public URL of your GitHub repository to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row">
                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input placeholder="https://github.com/owner/repo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full shrink-0 sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Wand2 />
                  )}
                  <span className="ml-2">{isLoading ? 'Generating...' : 'Generate'}</span>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-center py-10 animate-in fade-in-50 duration-500">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="font-headline text-xl font-medium text-muted-foreground">Analyzing repository & generating README...</p>
             <p className="text-sm text-muted-foreground/80">This may take a moment. Please don't close the page.</p>
          </div>
        )}

        {readmeContent && !isLoading && (
          <Card className="w-full animate-in fade-in-50 duration-500 border-accent/20">
            <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-headline">Generated README</CardTitle>
                <CardDescription>Review, edit, and use your new README.</CardDescription>
              </div>
              <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button variant="secondary" onClick={handleDownload} className="w-full sm:w-auto bg-accent/90 hover:bg-accent text-accent-foreground">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={readmeContent}
                onChange={(e) => setReadmeContent(e.target.value)}
                className="min-h-[500px] w-full resize-y rounded-md bg-secondary/30 p-4 font-mono text-sm"
                aria-label="Generated README content"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
