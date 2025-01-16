import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    title: "Project 1",
    description: "A description of your first project goes here. Talk about what problem it solves and what technologies you used.",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/yourusername/project1",
    demo: "https://project1-demo.com"
  },
  {
    title: "Project 2",
    description: "A description of your second project goes here. Highlight the key features and your role in development.",
    technologies: ["Node.js", "Express", "MongoDB"],
    github: "https://github.com/yourusername/project2",
    demo: "https://project2-demo.com"
  },
  {
    title: "Project 3",
    description: "A description of your third project goes here. Explain what makes this project special.",
    technologies: ["Vue.js", "Firebase", "SCSS"],
    github: "https://github.com/yourusername/project3",
    demo: "https://project3-demo.com"
  }
];

export default function Portfolio() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">My Portfolio</h1>
        <p className="text-xl text-muted-foreground">
          Here are some of the projects I've worked on
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </div>
  );
}
