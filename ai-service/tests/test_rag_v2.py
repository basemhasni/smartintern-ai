import unittest

from app.rag.chunking_service_v2 import chunk_document
from app.rag.embedding_service_v2 import generate_embedding, validate_embedding
from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.rag.hybrid_retrieval_service_v2 import hybrid_search
from app.rag.metadata_enrichment_service import enrich_metadata
from app.rag.reranking_service_v2 import rerank_results


class RagV2Tests(unittest.TestCase):
    def test_chunking_preserves_sections_and_metadata(self):
        result = chunk_document("Competences:\nReact, Node.js et PostgreSQL.\nProjets:\nAPI REST realisee avec Node.js et PostgreSQL.", "CV", {"studentId": "s1"})
        self.assertGreaterEqual(result["count"], 1)
        self.assertEqual(result["chunks"][0]["metadata"]["studentId"], "s1")
        all_skills = {skill for chunk in result["chunks"] for skill in chunk["metadata"]["skills"]}
        self.assertIn("React", all_skills)

    def test_embedding_fallback_is_stable_and_valid(self):
        first = generate_embedding("React Node.js")
        self.assertEqual(first, generate_embedding("React Node.js"))
        self.assertTrue(validate_embedding(first))

    def test_hybrid_search_prefers_precise_document(self):
        documents = [
            {"id": "1", "ownerType": "CV", "ownerId": "a", "text": "Projet React Node.js avec PostgreSQL", "metadata": {"section": "projects"}},
            {"id": "2", "ownerType": "CV", "ownerId": "b", "text": "Projet Java Spring Boot", "metadata": {}},
        ]
        result = hybrid_search("React Node.js", documents)
        self.assertEqual(result["results"][0]["id"], "1")

    def test_duplicate_chunks_are_limited(self):
        documents = [{"id": str(index), "ownerType": "CV", "ownerId": "same", "text": "React Node.js", "metadata": {}} for index in range(5)]
        self.assertLessEqual(len(hybrid_search("React", documents, options={"topK": 5})["results"]), 2)

    def test_insufficient_context_is_explicit(self):
        answer = generate_grounded_answer("Question sans contexte", [])
        self.assertEqual(answer["confidence"], "LOW")
        self.assertEqual(answer["citations"], [])

    def test_citations_never_expose_embeddings(self):
        answer = generate_grounded_answer("React", [{"id": "1", "title": "CV", "text": "React dans un projet.", "score": 0.8, "embedding": [1, 2], "metadata": {"chunkIndex": 2}}])
        self.assertNotIn("embedding", answer["citations"][0])

    def test_reranking_uses_important_sections(self):
        results = rerank_results("React", [{"id": "1", "text": "React", "score": 0.4, "metadata": {"section": "skills"}}, {"id": "2", "text": "React", "score": 0.4, "metadata": {}}])
        self.assertEqual(results[0]["id"], "1")

    def test_metadata_detects_skills(self):
        metadata = enrich_metadata("Application React avec Docker", "CV", {})
        self.assertIn("React", metadata["skills"])
        self.assertIn("Docker", metadata["skills"])


if __name__ == "__main__":
    unittest.main()
