import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Run 'python -m spacy download en_core_web_sm' in your terminal.")
    exit(1)

def english_to_gloss(sentence: str) -> list:
    """
    Parses English sentence into Sign Language Gloss tokens.
    Rules applied:
    1. Lemmatization (e.g., 'writing' -> 'WRITE').
    2. Filter out auxiliary verbs, articles, and punctuation.
    3. Shift temporal/time words to the start (Topic-Comment grammar).
    """
    doc = nlp(sentence.strip())
    
    time_words = []
    main_glosses = []
    
    excluded_pos = {"DET", "PUNCT", "SPACE", "CCONJ"}
    excluded_deps = {"aux", "auxpass"}
    time_indicators = {"today", "tomorrow", "yesterday", "now", "later", "morning", "night"}

    for token in doc:
        if token.pos_ in excluded_pos or token.dep_ in excluded_deps:
            continue
            
        lemma_upper = token.lemma_.upper()
        
        if token.ent_type_ == "DATE" or token.lemma_.lower() in time_indicators:
            time_words.append(lemma_upper)
        else:
            main_glosses.append(lemma_upper)
            
    return time_words + main_glosses

if __name__ == "__main__":
    sample_text = "The student is writing a Python program today"
    parsed = english_to_gloss(sample_text)
    print(f"\nOriginal: {sample_text}")
    print(f"Gloss   : {parsed}\n")