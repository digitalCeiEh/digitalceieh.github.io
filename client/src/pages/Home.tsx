import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">
          Hi, I'm <span className="text-primary">Your Name</span> 👋
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A passionate web developer crafting beautiful and functional web experiences
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/portfolio">View My Work</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Node.js", "Tailwind CSS", "Git"].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <p className="text-muted-foreground">
              I'm a web developer with a passion for creating modern and user-friendly applications.
              I love learning new technologies and solving complex problems.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
