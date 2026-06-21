"""Canonical skill taxonomy for deterministic extraction and matching."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SkillDefinition:
    canonical_name: str
    aliases: tuple[str, ...]
    category: str
    related_skills: tuple[str, ...] = ()
    weight: float = 1.0


SKILL_TAXONOMY: tuple[SkillDefinition, ...] = (
    SkillDefinition("HTML", ("html", "html5"), "Frontend", ("CSS", "JavaScript"), 0.8),
    SkillDefinition("CSS", ("css", "css3", "cascading style sheets"), "Frontend", ("HTML", "Tailwind CSS", "Bootstrap"), 0.8),
    SkillDefinition("JavaScript", ("javascript", "java script", "js", "ecmascript"), "Frontend", ("TypeScript", "Node.js"), 1.0),
    SkillDefinition("TypeScript", ("typescript", "type script", "ts"), "Frontend", ("JavaScript",), 1.1),
    SkillDefinition("React", ("react", "reactjs", "react js", "react.js"), "Frontend", ("JavaScript", "TypeScript", "React Native"), 1.2),
    SkillDefinition("Angular", ("angular", "angularjs", "angular js"), "Frontend", ("TypeScript", "JavaScript", "React", "Vue"), 1.2),
    SkillDefinition("Vue", ("vue", "vuejs", "vue js", "vue.js"), "Frontend", ("JavaScript", "TypeScript", "React"), 1.1),
    SkillDefinition("Svelte", ("svelte", "sveltekit", "svelte kit"), "Frontend", ("JavaScript", "TypeScript"), 1.0),
    SkillDefinition("Tailwind CSS", ("tailwind", "tailwindcss", "tailwind css"), "Frontend", ("CSS", "Bootstrap"), 0.8),
    SkillDefinition("Bootstrap", ("bootstrap", "twitter bootstrap"), "Frontend", ("CSS", "Tailwind CSS"), 0.7),

    SkillDefinition("Node.js", ("node", "nodejs", "node js", "node.js"), "Backend", ("JavaScript", "Express.js"), 1.2),
    SkillDefinition("Express.js", ("express", "expressjs", "express js", "express.js"), "Backend", ("Node.js", "REST API"), 1.0),
    SkillDefinition("Java", ("java", "java ee", "jakarta ee"), "Backend", ("Spring Boot",), 1.1),
    SkillDefinition("Spring Boot", ("spring", "springboot", "spring boot", "spring framework"), "Backend", ("Java", "REST API"), 1.2),
    SkillDefinition("Python", ("python", "python3", "python 3"), "Backend", ("FastAPI", "Django", "Pandas", "NumPy"), 1.1),
    SkillDefinition("FastAPI", ("fastapi", "fast api"), "Backend", ("Python", "REST API"), 1.0),
    SkillDefinition("Django", ("django", "django rest framework", "drf"), "Backend", ("Python", "REST API"), 1.0),
    SkillDefinition("PHP", ("php", "php8", "php 8"), "Backend", ("Laravel",), 1.0),
    SkillDefinition("Laravel", ("laravel",), "Backend", ("PHP", "REST API"), 1.0),
    SkillDefinition("REST API", ("rest api", "restful api", "api rest", "api restful", "rest"), "Backend", ("Postman",), 1.1),

    SkillDefinition("PostgreSQL", ("postgresql", "postgres", "postgre sql", "pgsql"), "Database", ("SQL", "MySQL", "Prisma"), 1.1),
    SkillDefinition("MySQL", ("mysql", "my sql"), "Database", ("SQL", "PostgreSQL"), 1.0),
    SkillDefinition("MongoDB", ("mongodb", "mongo db", "mongo"), "Database", ("Database",), 1.0),
    SkillDefinition("Redis", ("redis", "redis cache"), "Database", (), 0.9),
    SkillDefinition("SQL", ("sql", "structured query language"), "Database", ("PostgreSQL", "MySQL"), 0.9),
    SkillDefinition("Prisma", ("prisma", "prisma orm", "prismajs"), "Database", ("ORM", "PostgreSQL", "Node.js"), 0.9),
    SkillDefinition("ORM", ("orm", "object relational mapping", "mapping objet relationnel"), "Database", ("Prisma",), 0.7),

    SkillDefinition("Docker", ("docker", "dockerfile", "docker compose", "docker-compose"), "DevOps / Cloud", ("Kubernetes", "CI/CD"), 1.1),
    SkillDefinition("Kubernetes", ("kubernetes", "k8s"), "DevOps / Cloud", ("Docker", "CI/CD"), 1.2),
    SkillDefinition("GitHub Actions", ("github actions", "github action", "actions workflow"), "DevOps / Cloud", ("CI/CD", "GitHub"), 1.0),
    SkillDefinition("Jenkins", ("jenkins", "jenkins pipeline"), "DevOps / Cloud", ("CI/CD",), 1.0),
    SkillDefinition("CI/CD", ("ci cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment"), "DevOps / Cloud", ("GitHub Actions", "Jenkins", "Docker"), 1.1),
    SkillDefinition("AWS", ("aws", "amazon web services"), "DevOps / Cloud", ("Azure", "Docker"), 1.1),
    SkillDefinition("Azure", ("azure", "microsoft azure"), "DevOps / Cloud", ("AWS",), 1.1),
    SkillDefinition("Linux", ("linux", "ubuntu", "debian"), "DevOps / Cloud", ("Nginx", "Docker"), 0.9),
    SkillDefinition("Nginx", ("nginx",), "DevOps / Cloud", ("Linux", "Docker"), 0.9),

    SkillDefinition("Machine Learning", ("machine learning", "ml", "apprentissage automatique"), "Data / AI", ("Python", "NumPy", "Pandas"), 1.2),
    SkillDefinition("NLP", ("nlp", "natural language processing", "traitement du langage naturel"), "Data / AI", ("Machine Learning", "RAG"), 1.1),
    SkillDefinition("LangChain", ("langchain", "lang chain"), "Data / AI", ("LangGraph", "RAG"), 1.0),
    SkillDefinition("LangGraph", ("langgraph", "lang graph"), "Data / AI", ("LangChain", "RAG"), 1.0),
    SkillDefinition("RAG", ("rag", "retrieval augmented generation", "generation augmentee par recuperation"), "Data / AI", ("Vector Database", "NLP", "LangChain"), 1.1),
    SkillDefinition("Vector Database", ("vector database", "vector db", "base vectorielle", "pgvector", "pinecone", "weaviate"), "Data / AI", ("RAG", "PostgreSQL"), 1.0),
    SkillDefinition("Pandas", ("pandas",), "Data / AI", ("Python", "NumPy"), 0.9),
    SkillDefinition("NumPy", ("numpy", "num py"), "Data / AI", ("Python", "Pandas"), 0.9),

    SkillDefinition("Flutter", ("flutter",), "Mobile", ("Dart", "Android", "iOS"), 1.2),
    SkillDefinition("Dart", ("dart",), "Mobile", ("Flutter",), 1.0),
    SkillDefinition("React Native", ("react native", "react-native"), "Mobile", ("React", "Android", "iOS"), 1.1),
    SkillDefinition("Android", ("android", "android studio"), "Mobile", ("Kotlin", "Flutter", "React Native"), 1.0),
    SkillDefinition("iOS", ("ios", "swift ui", "swiftui"), "Mobile", ("Flutter", "React Native"), 1.0),
    SkillDefinition("Kotlin", ("kotlin",), "Mobile", ("Android",), 1.0),

    SkillDefinition("Jest", ("jest", "jestjs", "jest js"), "Testing / QA", ("Unit Testing", "JavaScript"), 0.9),
    SkillDefinition("Cypress", ("cypress",), "Testing / QA", ("Integration Testing", "JavaScript"), 1.0),
    SkillDefinition("Playwright", ("playwright",), "Testing / QA", ("Integration Testing", "JavaScript"), 1.0),
    SkillDefinition("Selenium", ("selenium", "selenium webdriver"), "Testing / QA", ("Integration Testing",), 1.0),
    SkillDefinition("Postman", ("postman",), "Testing / QA", ("REST API", "Integration Testing"), 0.8),
    SkillDefinition("Unit Testing", ("unit testing", "unit tests", "tests unitaires", "test unitaire"), "Testing / QA", ("Integration Testing", "Jest"), 0.9),
    SkillDefinition("Integration Testing", ("integration testing", "integration tests", "tests integration", "test integration", "tests d integration", "test d integration"), "Testing / QA", ("Unit Testing", "Cypress", "Playwright"), 0.9),

    SkillDefinition("Git", ("git", "version control", "gestion de versions"), "Tools", ("GitHub",), 0.8),
    SkillDefinition("GitHub", ("github", "git hub"), "Tools", ("Git", "GitHub Actions"), 0.8),
    SkillDefinition("Jira", ("jira",), "Tools", (), 0.6),
    SkillDefinition("Figma", ("figma",), "Tools", (), 0.6),
    SkillDefinition("VS Code", ("vs code", "vscode", "visual studio code"), "Tools", (), 0.5),
)


SKILLS_BY_NAME = {skill.canonical_name: skill for skill in SKILL_TAXONOMY}


def get_skill(canonical_name: str) -> SkillDefinition | None:
    return SKILLS_BY_NAME.get(canonical_name)


def get_related_skills(canonical_name: str) -> tuple[str, ...]:
    definition = get_skill(canonical_name)
    return definition.related_skills if definition else ()

