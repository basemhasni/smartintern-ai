import { ArrowRight, Bot, GitBranch, SearchCheck, ShieldCheck } from 'lucide-react';

import SectionHeading from './SectionHeading.jsx';

const agents = ['CVAnalysisAgent', 'MatchingAgent', 'RecommendationAgent', 'CareerAssistantAgent'];

function AIAgentsSection() {
  return (
    <section id="ia" className="stitch-container py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <SectionHeading eyebrow="Intelligence artificielle" title="Une IA qui explique ses choix">
          Les agents specialistes analysent les documents, comparent les competences et produisent des conseils controles. Le RAG sert de contexte, pas de pretexte a inventer.
        </SectionHeading>
        <div className="rounded-[22px] border border-line bg-white p-6 shadow-stitch">
          <div className="grid gap-3">
            {agents.map((agent, index) => (
              <div key={agent} className="flex items-center gap-3 rounded-stitch border border-line bg-canvas/70 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aiSoft text-ai">
                  {index === 0 ? <Bot size={18} /> : index === 1 ? <GitBranch size={18} /> : index === 2 ? <SearchCheck size={18} /> : <ShieldCheck size={18} />}
                </span>
                <span className="text-sm font-extrabold text-ink">{agent}</span>
                {index < agents.length - 1 ? <ArrowRight className="ml-auto text-muted" size={18} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-stitch bg-primarySoft p-4 text-sm leading-6 text-primary">
            LangGraph organise les workflows, le matching reste explicable, et les reponses evitent de presenter une information non trouvee comme un fait.
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIAgentsSection;
