#How LDA works (simplified)
#1. Preparation LDA begins by treating each document as a collection of words without considering their order or grammar (the "bag-of-words" assumption).
#2. Assumption LDA assumes that each document is a mix of a few topics, and each topic is a mix of a few words.
#3. Iteration LDA starts by randomly assigning a topic to each word in each document. It then repeatedly refines these assignments by calculating two probabilities:
#3a. The likelihood of a specific topic appearing in a document (based on how many words in that document are already assigned to that topic).
#3b. The likelihood of a specific word appearing within a topic (based on how often that word is found in other documents assigned to that topic).
#4. Refinement The algorithm iteratively reassigns words to topics based on these probabilities, aiming to improve the consistency of topic-word distributions and document-topic distributions.
#5. Output After a series of iterations, LDA outputs:
#5a. Document-topic distributions: This indicates which topics are present in each document and their respective proportions.
#5b. Topic-word distributions: This lists the words that belong to each topic, along with their probabilities within that topic. 

# Simple implementation of above algorithm using Python; implementing from scratch; efficiency is not a concern here; clarity is. Only uses Python standard libraries.
import random
from collections import defaultdict
class LDA:
    def __init__(self, num_topics, num_iterations):
        self.num_topics = num_topics
        self.num_iterations = num_iterations
        self.documents = []
        self.vocab = set()
        self.topic_word_counts = defaultdict(lambda: defaultdict(int)) # Gives count of words in each topic
        self.document_topic_counts = defaultdict(lambda: defaultdict(int)) # Gives count of topics in each document
        self.topic_assignments = []  # List of lists, where each inner list contains topic assignments for words in a document
        self.word_counts = defaultdict(int)  # Counts of each word across all documents
        self.topic_counts = defaultdict(int) # Counts of each topic across all documents
        self.document_lengths = []  # Length of each document in terms of number of words
        self.word_topic_assignments = [] # List of lists, where each inner list contains topic assignments for words in a document
    def add_document(self, document):
        words = document.split()
        self.documents.append(words)
        self.document_lengths.append(len(words))
        self.word_topic_assignments.append([None] * len(words))
        for word in words:
            self.vocab.add(word)
            self.word_counts[word] += 1
        # Randomly assign initial topics to words
        initial_assignments = [random.randint(0, self.num_topics - 1) for _ in words]
        self.topic_assignments.append(initial_assignments)
        for i, word in enumerate(words):
            topic = initial_assignments[i]
            self.topic_word_counts[topic][word] += 1
            self.document_topic_counts[len(self.documents) - 1][topic] += 1
            self.topic_counts[topic] += 1
    def fit(self):
        for _ in range(self.num_iterations):
            for doc_index, words in enumerate(self.documents):
                for word_index, word in enumerate(words):
                    current_topic = self.topic_assignments[doc_index][word_index]
                    # Remove current word from counts
                    self.topic_word_counts[current_topic][word] -= 1
                    self.document_topic_counts[doc_index][current_topic] -= 1
                    self.topic_counts[current_topic] -= 1
                    
                    # Calculate probabilities for each topic
                    topic_probabilities = []
                    for topic in range(self.num_topics):
                        if self.topic_counts[topic] > 0:
                            word_topic_count = self.topic_word_counts[topic][word] # How many times this word appears in this topic
                            doc_topic_count = self.document_topic_counts[doc_index][topic] # How many times this topic appears in this document
                            total_words_in_topic = sum(self.topic_word_counts[topic].values()) # Total words in this topic
                            total_docs_in_topic = sum(self.document_topic_counts[doc_index].values()) # Total topics in this document
                            probability = (word_topic_count + 1) / (total_words_in_topic + len(self.vocab)) * (doc_topic_count + 1) / (total_docs_in_topic + self.num_topics) # Using Laplace smoothing
                            topic_probabilities.append(probability)
                        else:
                            topic_probabilities.append(0)
                    # Normalize probabilities
                    total_probability = sum(topic_probabilities)
                    if total_probability > 0:
                        topic_probabilities = [p / total_probability for p in topic_probabilities] # Normalize to sum to 1
                    else:
                        topic_probabilities = [1 / self.num_topics] * self.num_topics  # Uniform distribution if all counts are zero
                    # Sample a new topic based on probabilities
                    new_topic = random.choices(range(self.num_topics), weights=topic_probabilities)[0]
                    # Assign the new topic
                    self.topic_assignments[doc_index][word_index] = new_topic
                    self.topic_word_counts[new_topic][word] += 1
                    self.document_topic_counts[doc_index][new_topic] += 1
                    self.topic_counts[new_topic] += 1
    def get_document_topics(self):
        document_topics = []
        for doc_index in range(len(self.documents)):
            total_words = self.document_lengths[doc_index]
            topic_distribution = {topic: (self.document_topic_counts[doc_index][topic] + 1) / (total_words + self.num_topics) for topic in range(self.num_topics)}
            document_topics.append(topic_distribution)
        return document_topics
    def get_topic_words(self, top_n=10):
        topic_words = {}
        for topic in range(self.num_topics):
            words = sorted(self.topic_word_counts[topic].items(), key=lambda x: x[1], reverse=True)[:top_n]
            topic_words[topic] = [word for word, count in words]
        return topic_words
    def print_topics(self, top_n=10):
        topic_words = self.get_topic_words(top_n)
        for topic, words in topic_words.items():
            print(f"Topic {topic}: {', '.join(words)}")
    def print_document_topics(self):
        document_topics = self.get_document_topics()
        for doc_index, topic_distribution in enumerate(document_topics):
            print(f"Document {doc_index}:")
            for topic, prob in topic_distribution.items():
                print(f"  Topic {topic}: {prob:.4f}")
            print()
# Example usage
if __name__ == "__main__":
    lda = LDA(num_topics=3, num_iterations=100)
    documents = [
        "apple banana fruit",
        "carrot vegetable healthy",
        "apple orange fruit",
        "carrot apple healthy",
        "banana orange fruit",
        "carrot banana vegetable",
        "fruit vegetable healthy",
        "apple carrot healthy",
        "banana fruit healthy",
        "orange fruit vegetable"
    ]
    for doc in documents:
        lda.add_document(doc)
    lda.fit()
    lda.print_topics()
    lda.print_document_topics()
# Note: This is a simplified implementation of LDA and may not be suitable for large datasets or production use.
# It is meant for educational purposes to illustrate the basic mechanics of LDA.