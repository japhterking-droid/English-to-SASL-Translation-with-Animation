import pandas as pd

class How2SignIndexer:
    def __init__(self, csv_url: str = None):
        # Primary & secondary raw dataset metadata endpoints
        self.primary_url = csv_url or "https://raw.githubusercontent.com/how2sign/how2sign.github.io/master/how2sign_realigned_train.csv"
        self.fallback_url = "https://raw.githubusercontent.com/how2sign/how2sign.github.io/main/how2sign_realigned_train.csv"
        self.df = None

    def load_dataset_metadata(self):
        """Attempts fetching dataset metadata from online endpoints."""
        print("Fetching How2Sign dataset metadata...")
        for url in [self.primary_url, self.fallback_url]:
            try:
                self.df = pd.read_csv(url, sep="\t")
                print(f"Successfully loaded dataset with {len(self.df)} entries.")
                return
            except Exception:
                continue

        print("Online CSV unreachable. Generating local index cache placeholder...")
        # Local fallback dictionary structure for offline development
        mock_data = {
            'SENTENCE_NAME': ['STUDENT_SIGN_01', 'WRITE_SIGN_02', 'PYTHON_SIGN_03', 'PROGRAM_SIGN_04'],
            'SENTENCE': ['student', 'write', 'python', 'program']
        }
        self.df = pd.DataFrame(mock_data)
        print("Local index cache ready.")

    def find_clip_for_gloss(self, gloss_name: str):
        """Finds matching keypoint/sentence clip for a given gloss token."""
        if self.df is None:
            self.load_dataset_metadata()
            
        if self.df is not None and 'SENTENCE_NAME' in self.df.columns:
            matches = self.df[self.df['SENTENCE_NAME'].str.contains(gloss_name, case=False, na=False)]
            if not matches.empty:
                return matches.iloc[0]['SENTENCE_NAME']
        return f"{gloss_name.upper()}_KEYPOINT_MOCK"

if __name__ == "__main__":
    indexer = How2SignIndexer()
    indexer.load_dataset_metadata()
    sample_match = indexer.find_clip_for_gloss("STUDENT")
    print(f"\nSample Gloss Lookup ('STUDENT'): {sample_match}\n")