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


@dataclass(frozen=True)
class SkillRelation:
    relation: str
    coverage: float
    reason: str


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
    SkillDefinition("Spring Boot", ("springboot", "spring boot"), "Backend", ("Java", "Spring Framework", "REST API"), 1.2),
    SkillDefinition("Spring Framework", ("spring", "spring framework", "spring core", "spring mvc"), "Backend", ("Java", "Spring Boot"), 1.1),
    SkillDefinition("Python", ("python", "python3", "python 3"), "Backend", ("FastAPI", "Django", "Pandas", "NumPy"), 1.1),
    SkillDefinition("FastAPI", ("fastapi", "fast api"), "Backend", ("Python", "REST API"), 1.0),
    SkillDefinition("Flask", ("flask", "flask api"), "Backend", ("Python", "REST API"), 1.0),
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
    SkillDefinition("GitLab CI", ("gitlab ci", "gitlab ci cd", "gitlab pipeline"), "DevOps / Cloud", ("CI/CD", "Git"), 1.0),
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


# Relations directionnelles: (competence du candidat, exigence de l'offre).
# Elles evitent qu'une proximite d'ecosysteme devienne une equivalence technique.
SKILL_RELATIONS: dict[tuple[str, str], SkillRelation] = {
    ("Angular", "React"): SkillRelation("TRANSFERABLE", 0.34, "Les concepts frontend sont transferables, mais Angular ne prouve pas React."),
    ("React", "Angular"): SkillRelation("TRANSFERABLE", 0.34, "Les concepts frontend sont transferables, mais React ne prouve pas Angular."),
    ("React Native", "React"): SkillRelation("TRANSFERABLE", 0.38, "React Native partage des concepts React sans prouver une pratique React Web."),
    ("React", "React Native"): SkillRelation("TRANSFERABLE", 0.32, "React Web apporte des bases transferables sans prouver React Native."),
    ("Docker", "Kubernetes"): SkillRelation("RELATED", 0.35, "Docker est lie a l'orchestration, mais ne prouve pas Kubernetes."),
    ("Kubernetes", "Docker"): SkillRelation("RELATED", 0.45, "Kubernetes implique souvent des conteneurs, sans prouver une pratique Docker detaillee."),
    ("SQL", "PostgreSQL"): SkillRelation("TRANSFERABLE", 0.35, "SQL est transferable, mais ne prouve pas les specificites PostgreSQL."),
    ("PostgreSQL", "SQL"): SkillRelation("RELATED", 0.65, "PostgreSQL fournit une preuve directe de pratique SQL relationnelle."),
    ("Node.js", "Express.js"): SkillRelation("TRANSFERABLE", 0.30, "Node.js est le runtime, mais ne prouve pas l'utilisation d'Express."),
    ("Express.js", "Node.js"): SkillRelation("RELATED", 0.65, "Express est execute sur Node.js et constitue un signal technique pertinent."),
    ("Jenkins", "CI/CD"): SkillRelation("TRANSFERABLE", 0.45, "Jenkins est un outil CI/CD, mais son nom seul ne prouve pas une chaine complete."),
    ("GitHub Actions", "CI/CD"): SkillRelation("TRANSFERABLE", 0.45, "GitHub Actions est un outil CI/CD, mais son nom seul ne prouve pas une chaine complete."),
    ("GitLab CI", "CI/CD"): SkillRelation("TRANSFERABLE", 0.45, "GitLab CI est un outil CI/CD, mais son nom seul ne prouve pas une chaine complete."),
    ("Spring Framework", "Spring Boot"): SkillRelation("TRANSFERABLE", 0.42, "Spring Framework apporte des bases utiles, mais ne prouve pas Spring Boot."),
    ("Spring Boot", "Spring Framework"): SkillRelation("RELATED", 0.68, "Spring Boot repose sur Spring Framework et fournit un signal direct."),
    ("Java", "JavaScript"): SkillRelation("DIFFERENT", 0.0, "Java et JavaScript sont des langages distincts."),
    ("JavaScript", "Java"): SkillRelation("DIFFERENT", 0.0, "JavaScript et Java sont des langages distincts."),
    ("FastAPI", "Flask"): SkillRelation("DIFFERENT", 0.0, "FastAPI et Flask sont deux frameworks Python distincts."),
    ("Flask", "FastAPI"): SkillRelation("DIFFERENT", 0.0, "Flask et FastAPI sont deux frameworks Python distincts."),
    ("Git", "GitLab CI"): SkillRelation("DIFFERENT", 0.0, "Git est un outil de versioning et ne prouve pas GitLab CI."),
    ("GitLab CI", "Git"): SkillRelation("RELATED", 0.35, "GitLab CI est lie aux depots Git sans prouver une pratique Git complete."),
}


def get_skill(canonical_name: str) -> SkillDefinition | None:
    return SKILLS_BY_NAME.get(canonical_name)


def get_related_skills(canonical_name: str) -> tuple[str, ...]:
    definition = get_skill(canonical_name)
    return definition.related_skills if definition else ()


def get_skill_relation(candidate_skill: str, required_skill: str) -> SkillRelation | None:
    """Return a conservative, directional relation between two canonical skills."""
    if candidate_skill == required_skill:
        return SkillRelation("EXACT", 1.0, "La competence correspond exactement a l'exigence.")
    explicit = SKILL_RELATIONS.get((candidate_skill, required_skill))
    if explicit:
        return explicit
    candidate = get_skill(candidate_skill)
    required = get_skill(required_skill)
    if candidate and required and (
        required_skill in candidate.related_skills or candidate_skill in required.related_skills
    ):
        return SkillRelation(
            "RELATED",
            0.32,
            f"{candidate_skill} est liee a {required_skill}, sans constituer une preuve de maitrise.",
        )
    return None

