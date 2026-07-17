from core.skill_ner import HuggingFaceSkillExtractor


def test_merges_bio_tokens_into_skill_spans():
    extractor = HuggingFaceSkillExtractor()
    text = "Build REST APIs using Python and SQL."
    entities = [
        {"entity": "B", "score": 0.99, "start": 6, "end": 10},
        {"entity": "I", "score": 0.98, "start": 11, "end": 15},
        {"entity": "B", "score": 0.99, "start": 22, "end": 28},
        {"entity": "B", "score": 0.99, "start": 33, "end": 36},
    ]
    assert extractor._merge_bio_spans(text, entities) == ["REST APIs", "Python", "SQL"]


def test_inference_uses_pipeline_without_unsupported_tokenizer_kwargs():
    extractor = HuggingFaceSkillExtractor()
    calls = []

    def fake_pipeline(text):
        calls.append(text)
        return [{"entity": "B", "score": 0.99, "start": 0, "end": 6}]

    extractor._pipeline = fake_pipeline

    assert extractor.extract("Python development") == ["Python"]
    assert calls == ["Python development"]
