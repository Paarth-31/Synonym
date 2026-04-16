#import hell 
import os
import re
import nltk
import sys 
import json
import joblib
import torch
import torch.nn as nn
import pandas as pd
import numpy as np

from nltk.corpus import stopwords as nltk_stopwords

from PyPDF2 import PdfReader
from sumy.parsers.plaintext import PlaintextParser

from sumy.nlp.tokenizers import Tokenizer

from sumy.summarizers.luhn import LuhnSummarizer
from sentence_transformers import SentenceTransformer

from sklearn.feature_extraction.text import TfidfVectorizer

print("[STATUS] dependencies loaded\n")

if len(sys.argv) < 2:
    print(json.dumps({"success": False, "error": "No file path provided"}))
    sys.exit(1)

file_path = sys.argv[1]

if not os.path.exists(file_path):
    print(json.dumps({"success": False, "error": f"File not found: {file_path}"}))
    sys.exit(1)

TEMP_DIR = "lmao"
SENTENCES_PER_SUMMARY = 5
WORDS_PER_CHUNK = 5000
KEYWORD_LIMIT = 100
FACTOR = 1  # Fraction of pages to process (1 = 100%, 0.5 = 50%). Lower for faster processing of large books.

'''
SORTED_SCORES is the genre dict
SORTED_KEYWORDS[1] is the keyword list 
'''

class GenreClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_labels, dropout=0.3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_labels),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

def clean(text):
    # stop_words = set(["0o", "0s", "3a", "3b", "3d", "6b", "6o", "a", "a1", "a2", "a3", "a4", "ab", "able", "about", "above", "abst", "ac", "accordance", "according", "accordingly", "across", "act", "actually", "ad", "added", "adj", "ae", "af", "affected", "affecting", "affects", "after", "afterwards", "ag", "again", "against", "ah", "ain", "ain't", "aj", "al", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "announce", "another", "any", "anybody", "anyhow", "anymore", "anyone", "anything", "anyway", "anyways", "anywhere", "ao", "ap", "apart", "apparently", "appear", "appreciate", "appropriate", "approximately", "ar", "are", "aren", "arent", "aren't", "arise", "around", "as", "a's", "aside", "ask", "asking", "associated", "at", "au", "auth", "av", "available", "aw", "away", "awfully", "ax", "ay", "az", "b", "b1", "b2", "b3", "ba", "back", "bc", "bd", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "begin", "beginning", "beginnings", "begins", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "bi", "bill", "biol", "bj", "bk", "bl", "bn", "both", "bottom", "bp", "br", "brief", "briefly", "bs", "bt", "bu", "but", "bx", "by", "c", "c1", "c2", "c3", "ca", "call", "came", "can", "cannot", "cant", "can't", "cause", "causes", "cc", "cd", "ce", "certain", "certainly", "cf", "cg", "ch", "changes", "ci", "cit", "cj", "cl", "clearly", "cm",  "c'mon", "cn", "co", "com", "come", "comes", "con", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn", "couldnt", "couldn't", "course", "cp", "cq", "cr", "cry", "cs", "c's", "ct", "cu", "currently", "cv", "cx", "cy", "cz", "d", "d2", "da", "date", "dc", "dd", "de", "definitely", "describe", "described", "despite", "detail", "df", "di", "did", "didn", "didn't", "different", "dj", "dk", "dl", "do", "does", "doesn", "doesn't", "doing", "don", "done", "don't", "down", "downwards", "dp", "dr", "ds", "dt", "du", "due", "during", "dx", "dy", "e", "e2", "e3", "ea", "each", "ec", "ed", "edu", "ee", "ef", "effect", "eg", "ei", "eight", "eighty", "either", "ej", "el", "eleven", "else", "elsewhere", "em", "empty", "en", "end", "ending", "enough", "entirely", "eo", "ep", "eq", "er", "es", "especially", "est", "et", "et-al", "etc", "eu", "ev", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "ey", "f", "f2", "fa", "far", "fc", "few", "ff", "fi", "fifteen", "fifth", "fify", "fill", "find", "fire", "first", "five", "fix", "fj", "fl", "fn", "fo", "followed", "following", "follows", "for", "former", "formerly", "forth", "forty", "found", "four", "fr", "from", "front", "fs", "ft", "fu", "full", "further", "furthermore", "fy", "g", "ga", "gave", "ge", "get", "gets", "getting", "gi", "give", "given", "gives", "giving", "gj", "gl", "go", "goes", "going", "gone", "got", "gotten", "gr", "greetings", "gs", "gy", "h", "h2", "h3", "had", "hadn", "hadn't", "happens", "hardly", "has", "hasn", "hasnt", "hasn't", "have", "haven", "haven't", "having", "he", "hed", "he'd", "he'll", "hello", "help", "hence", "her", "here", "hereafter", "hereby", "herein", "heres", "here's", "hereupon", "hers", "herself", "hes", "he's", "hh", "hi", "hid", "him", "himself", "his", "hither", "hj", "ho", "home", "hopefully", "how", "howbeit", "however", "how's", "hr", "hs", "http", "hu", "hundred", "hy", "i", "i2", "i3", "i4", "i6", "i7", "i8", "ia", "ib", "ibid", "ic", "id", "i'd", "ie", "if", "ig", "ignored", "ih", "ii", "ij", "il", "i'll", "im", "i'm", "immediate", "immediately", "importance", "important", "in", "inasmuch", "inc", "indeed", "index", "indicate", "indicated", "indicates", "information", "inner", "insofar", "instead", "interest", "into", "invention", "inward", "io", "ip", "iq", "ir", "is", "isn", "isn't", "it", "itd", "it'd", "it'll", "its", "it's", "itself", "iv", "i've", "ix", "iy", "iz", "j", "jj", "jr", "js", "jt", "ju", "just", "k", "ke", "keep", "keeps", "kept", "kg", "kj", "km", "know", "known", "knows", "ko", "l", "l2", "la", "largely", "last", "lately", "later", "latter", "latterly", "lb", "lc", "le", "least", "les", "less", "lest", "let", "lets", "let's", "lf", "like", "liked", "likely", "line", "little", "lj", "ll", "ll", "ln", "lo", "look", "looking", "looks", "los", "lr", "ls", "lt", "ltd", "m", "m2", "ma", "made", "mainly", "make", "makes", "many", "may", "maybe", "me", "mean", "means", "meantime", "meanwhile", "merely", "mg", "might", "mightn", "mightn't", "mill", "million", "mine", "miss", "ml", "mn", "mo", "more", "moreover", "most", "mostly", "move", "mr", "mrs", "ms", "mt", "mu", "much", "mug", "must", "mustn", "mustn't", "my", "myself", "n", "n2", "na", "name", "namely", "nay", "nc", "nd", "ne", "near", "nearly", "necessarily", "necessary", "need", "needn", "needn't", "needs", "neither", "never", "nevertheless", "new", "next", "ng", "ni", "nine", "ninety", "nj", "nl", "nn", "no", "nobody", "non", "none", "nonetheless", "noone", "nor", "normally", "nos", "not", "noted", "nothing", "novel", "now", "nowhere", "nr", "ns", "nt", "ny", "o", "oa", "ob", "obtain", "obtained", "obviously", "oc", "od", "of", "off", "often", "og", "oh", "oi", "oj", "ok", "okay", "ol", "old", "om", "omitted", "on", "once", "one", "ones", "only", "onto", "oo", "op", "oq", "or", "ord", "os", "ot", "other", "others", "otherwise", "ou", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "ow", "owing", "own", "ox", "oz", "p", "p1", "p2", "p3", "page", "pagecount", "pages", "par", "part", "particular", "particularly", "pas", "past", "pc", "pd", "pe", "per", "perhaps", "pf", "ph", "pi", "pj", "pk", "pl", "placed", "please", "plus", "pm", "pn", "po", "poorly", "possible", "possibly", "potentially", "pp", "pq", "pr", "predominantly", "present", "presumably", "previously", "primarily", "probably", "promptly", "proud", "provides", "ps", "pt", "pu", "put", "py", "q", "qj", "qu", "que", "quickly", "quite", "qv", "r", "r2", "ra", "ran", "rather", "rc", "rd", "re", "readily", "really", "reasonably", "recent", "recently", "ref", "refs", "regarding", "regardless", "regards", "related", "relatively", "research", "research-articl", "respectively", "resulted", "resulting", "results", "rf", "rh", "ri", "right", "rj", "rl", "rm", "rn", "ro", "rq", "rr", "rs", "rt", "ru", "run", "rv", "ry", "s", "s2", "sa", "said", "same", "saw", "say", "saying", "says", "sc", "sd", "se", "sec", "second", "secondly", "section", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "sf", "shall", "shan", "shan't", "she", "shed", "she'd", "she'll", "shes", "she's", "should", "shouldn", "shouldn't", "should've", "show", "showed", "shown", "showns", "shows", "si", "side", "significant", "significantly", "similar", "similarly", "since", "sincere", "six", "sixty", "sj", "sl", "slightly", "sm", "sn", "so", "some", "somebody", "somehow", "someone", "somethan", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "sp", "specifically", "specified", "specify", "specifying", "sq", "sr", "ss", "st", "still", "stop", "strongly", "sub", "substantially", "successfully", "such", "sufficiently", "suggest", "sup", "sure", "sy", "system", "sz", "t", "t1", "t2", "t3", "take", "taken", "taking", "tb", "tc", "td", "te", "tell", "ten", "tends", "tf", "th", "than", "thank", "thanks", "thanx", "that", "that'll", "thats", "that's", "that've", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "thered", "therefore", "therein", "there'll", "thereof", "therere", "theres", "there's", "thereto", "thereupon", "there've", "these", "they", "theyd", "they'd", "they'll", "theyre", "they're", "they've", "thickv", "thin", "think", "third", "this", "thorough", "thoroughly", "those", "thou", "though", "thoughh", "thousand", "three", "throug", "through", "throughout", "thru", "thus", "ti", "til", "tip", "tj", "tl", "tm", "tn", "to", "together", "too", "took", "top", "toward", "towards", "tp", "tq", "tr", "tried", "tries", "truly", "try", "trying", "ts", "t's", "tt", "tv", "twelve", "twenty", "twice", "two", "tx", "u", "u201d", "ue", "ui", "uj", "uk", "um", "un", "under", "unfortunately", "unless", "unlike", "unlikely", "until", "unto", "uo", "up", "upon", "ups", "ur", "us", "use", "used", "useful", "usefully", "usefulness", "uses", "using", "usually", "ut", "v", "va", "value", "various", "vd", "ve", "ve", "very", "via", "viz", "vj", "vo", "vol", "vols", "volumtype", "vq", "vs", "vt", "vu", "w", "wa", "want", "wants", "was", "wasn", "wasnt", "wasn't", "way", "we", "wed", "we'd", "welcome", "well", "we'll", "well-b", "went", "were", "we're", "weren", "werent", "weren't", "we've", "what", "whatever", "what'll", "whats", "what's", "when", "whence", "whenever", "when's", "where", "whereafter", "whereas", "whereby", "wherein", "wheres", "where's", "whereupon", "wherever", "whether", "which", "while", "whim", "whither", "who", "whod", "whoever", "whole", "who'll", "whom", "whomever",  "whos", "who's", "whose", "why", "why's", "wi", "widely", "will", "willing", "wish", "with", "within", "without", "wo", "won", "wonder", "wont", "won't", "words", "world", "would", "wouldn", "wouldnt", "wouldn't", "www", "x", "x1", "x2", "x3", "xf", "xi", "xj", "xk", "xl", "xn", "xo", "xs", "xt", "xv", "xx", "y", "y2", "yes", "yet", "yj", "yl", "you", "youd", "you'd", "you'll",  "your", "youre", "you're", "yours", "yourself", "yourselves", "you've", "yr", "ys", "yt", "z", "zero", "zi", "zz","accept", "accepted", "accepting", "achieve", "achieved", "achieving", "act", "acted", "acting", "add", "added", "adding", "admire", "admired", "admiring", "admit", "admitted", "admitting",  "advise", "advised", "advising", "affect", "affected", "affecting", "agree", "agreed", "agreeing", "allow", "allowed", "allowing", "announce", "announced", "announcing", "answer", "answered", "answering", "appear", "appeared", "appearing", "apply", "applied", "applying", "approach", "approached", "approaching", "argue", "argued", "arguing", "arise", "arose", "arising", "ask", "asked", "asking", "assume", "assumed", "assuming", "avoid", "avoided", "avoiding", "awake", "awoke", "awaking", "be", "was", "were", "being", "been", "become", "became", "becoming", "begin", "began", "beginning",  "believe", "believed", "believing", "belong", "belonged", "belonging", "build", "built", "building", "burn", "burned", "burning", "buy", "bought", "buying", "call", "called", "calling", "can", "could", "care", "cared", "caring", "carry", "carried", "carrying", "catch", "caught", "catching", "change", "changed", "changing", "choose", "chose", "choosing", "clean", "cleaned", "cleaning", "close", "closed", "closing", "come", "came", "coming", "compare", "compared", "comparing", "consider", "considered", "considering", "continue", "continued", "continuing", "control", "controlled", "controlling",    "cook", "cooked", "cooking", "copy", "copied", "copying", "cost", "costed", "costing", "count", "counted", "counting", "create", "created", "creating", "cry", "cried", "crying", "cut", "cutting", "dance", "danced", "dancing", "decide", "decided", "deciding", "describe", "described", "describing", "design", "designed", "designing", "develop", "developed", "developing", "die", "died", "dying", "discover", "discovered", "discovering", "discuss", "discussed", "discussing", "do", "did", "doing", "done", "draw", "drew", "drawing", "dream", "dreamed", "dreaming", "drink", "drank", "drinking", "drive", "drove", "driving", "eat", "ate", "eating", "enable", "enabled", "enabling", "encourage", "encouraged", "encouraging", "enjoy", "enjoyed", "enjoying", "enter", "entered", "entering", "exist", "existed", "existing", "expect", "expected", "expecting", "explain", "explained", "explaining", "face", "faced", "facing", "fail", "failed", "failing", "fall", "fell", "falling", "feel", "felt", "feeling", "fight", "fought", "fighting", "find", "found", "finding", "finish", "finished", "finishing", "fit", "fitted", "fitting", "fly", "flew", "flying", "focus", "focused", "focusing", "follow", "followed", "following", "forget", "forgot", "forgetting", "forgive", "forgave", "forgiving", "form", "formed", "forming", "found", "founded", "founding", "gain", "gained", "gaining", "get", "got", "getting", "give", "gave", "giving", "go", "went", "going", "grow", "grew", "growing", "guess", "guessed", "guessing", "happen", "happened", "happening", "hate", "hated", "hating", "have", "had", "having", "hear", "heard", "hearing", "help", "helped", "helping", "hide", "hid", "hiding", "hold", "held", "holding", "hope", "hoped", "hoping", "hurt", "hurting", "identify", "identified", "identifying", "imagine", "imagined", "imagining", "improve", "improved", "improving", "include", "included", "including", "increase", "increased", "increasing", "indicate", "indicated", "indicating", "influence", "influenced", "influencing", "intend", "intended", "intending", "introduce", "introduced", "introducing", "involve", "involved", "involving", "join", "joined", "joining", "jump", "jumped", "jumping", "keep", "kept", "keeping", "kill", "killed", "killing", "know", "knew", "knowing", "laugh", "laughed", "laughing", "learn", "learned", "learning", "leave", "left", "leaving", "lend", "lent", "lending", "let", "letting", "lie", "lay", "lying", "like", "liked", "liking", "listen", "listened", "listening", "live", "lived", "living", "look", "looked", "looking", "lose", "lost", "losing", "love", "loved", "loving", "make", "made", "making", "manage", "managed", "managing", "mean", "meant", "meaning", "measure", "measured", "measuring", "meet", "met", "meeting", "mention", "mentioned", "mentioning", "mind", "minded", "minding", "miss", "missed", "missing", "move", "moved", "moving", "need", "needed", "needing", "notice", "noticed", "noticing", "offer", "offered", "offering", "open", "opened", "opening", "operate", "operated", "operating", "order", "ordered", "ordering", "organize", "organized", "organizing", "own", "owned", "owning", "pay", "paid", "paying", "perform", "performed", "performing", "plan", "planned", "planning", "play", "played", "playing", "point", "pointed", "pointing", "prefer", "preferred", "preferring", "prepare", "prepared", "preparing", "present", "presented", "presenting", "press", "pressed", "pressing",  "produce", "produced", "producing", "promise", "promised", "promising", "protect", "protected", "protecting", "prove", "proved", "proving", "provide", "provided", "providing", "publish", "published", "publishing", "pull", "pulled", "pulling", "push", "pushed", "pushing", "put", "putting", "raise", "raised", "raising", "reach", "reached", "reaching", "read", "reading", "realize", "realized", "realizing", "receive", "received", "receiving", "recognize", "recognized", "recognizing", "record", "recorded", "recording", "reduce", "reduced", "reducing", "reflect", "reflected", "reflecting", "refuse", "refused", "refusing", "relate", "related", "relating", "remain", "remained", "remaining", "remember", "remembered", "remembering", "remove", "removed", "removing", "replace", "replaced", "replacing", "report", "reported", "reporting", "represent", "represented", "representing", "require", "required", "requiring", "result", "resulted", "resulting", "return", "returned", "returning", "reveal", "revealed", "revealing", "rise", "rose", "rising", "run", "ran", "running", "say", "said", "saying", "see", "saw", "seeing", "seem", "seemed", "seeming", "sell", "sold", "selling", "send", "sent", "sending", "serve", "served", "serving", "set", "setting", "show", "showed", "showing", "sit", "sat", "sitting", "sleep", "slept", "sleeping", "smile", "smiled", "smiling", "speak", "spoke", "speaking", "spend", "spent", "spending", "stand", "stood", "standing", "start", "started", "starting", "stay", "stayed", "staying",  "stop", "stopped", "stopping", "study", "studied", "studying", "succeed", "succeeded", "succeeding", "suggest", "suggested", "suggesting", "support", "supported", "supporting", "suppose", "supposed", "supposing","take", "took", "taking", "talk", "talked", "talking", "teach", "taught", "teaching", "tell", "told", "telling", "tend", "tended", "tending", "think", "thought", "thinking", "throw", "threw", "throwing", "touch", "touched", "touching", "travel", "traveled", "traveling", "try", "tried", "trying", "turn", "turned", "turning", "understand", "understood", "understanding", "use", "used", "using", "wait", "waited", "waiting", "walk", "walked", "walking", "want", "wanted", "wanting", "watch", "watched", "watching", "wear", "wore", "wearing", "win", "won", "winning", "wish", "wished", "wishing", "work", "worked", "working", "worry", "worried", "worrying", "write", "wrote", "writing", "arrive", "arrived", "arriving", "shout", "shouted", "shouting", "yell", "yelled", "yelling", "whisper", "whispered", "whispering", "hug", "hugged", "hugging", "kiss", "kissed", "kissing", "wonder", "wondered", "wondering", "reply", "replied", "replying", "respond", "responded", "responding", "thank", "thanked", "thanking", "complain", "complained", "complaining", "argue", "argued", "arguing", "disagree", "disagreed", "disagreeing", "promise", "promised", "promising", "believe", "believed", "believing", "guess", "guessed", "guessing", "hope", "hoped", "hoping", "expect", "expected", "expecting", "mean", "meant", "meaning", "forget", "forgot", "forgetting", "remind", "reminded", "reminding", "prefer", "preferred", "preferring", "suggest", "suggested", "suggesting", "invite", "invited", "inviting", "offer", "offered", "offering", "order", "ordered", "ordering", "pay", "paid", "paying", "send", "sent", "sending", "spend", "spent", "spending", "lend", "lent", "lending", "borrow", "borrowed", "borrowing", "buy", "bought", "buying", "sell", "sold", "selling", "teach", "taught", "teaching", "learn", "learned", "learning", "show", "showed", "showing", "tell", "told", "telling", "ask", "asked", "asking", "answer", "answered", "answering", "speak", "spoke", "speaking", "talk", "talked", "talking", "listen", "listened", "listening", "hear", "heard", "hearing", "see", "saw", "seeing", "watch", "watched", "watching", "look", "looked", "looking", "read", "read", "reading", "write", "wrote", "writing", "spell", "spelled", "spelling", "count", "counted", "counting", "add", "added", "adding", "subtract", "subtracted", "subtracting", "multiply", "multiplied", "multiplying", "divide", "divided", "dividing", "check", "checked", "checking", "test", "tested", "testing", "measure", "measured", "measuring", "calculate", "calculated", "calculating", "build", "built", "building", "make", "made", "making", "create", "created", "creating", "produce", "produced", "producing", "invent", "invented", "inventing", "draw", "drew", "drawing", "paint", "painted", "painting", "clean", "cleaned", "cleaning", "wash", "washed", "washing", "cook", "cooked", "cooking", "bake", "baked", "baking", "boil", "boiled", "boiling", "fry", "fried", "frying", "cut", "cutting", "slice", "sliced", "slicing", "open", "opened", "opening", "close", "closed", "closing", "shut", "shutting", "cover", "covered", "covering", "move", "moved", "moving", "lift", "lifted", "lifting", "carry", "carried", "carrying", "push", "pushed", "pushing", "pull", "pulled", "pulling", "throw", "threw", "throwing", "catch", "caught", "catching", "drop", "dropped", "dropping", "break", "broke", "breaking", "fix", "fixed", "fixing", "repair", "repaired", "repairing", "tie", "tied", "tying", "untie", "untied", "untying", "hold", "held", "holding", "keep", "kept", "keeping", "leave", "left", "leaving", "bring", "brought", "bringing", "take", "took", "taking", "get", "got", "getting", "put", "putting", "set", "setting", "lay", "laid", "laying", "stand", "stood", "standing", "sit", "sat", "sitting", "lie", "lay", "lying", "sleep", "slept", "sleeping", "wake", "woke", "waking", "dream", "dreamed", "dreaming", "begin", "began", "beginning", "start", "started", "starting", "finish", "finished", "finishing", "end", "ended", "ending", "stop", "stopped", "stopping", "continue", "continued", "continuing", "stay", "stayed", "staying", "remain", "remained", "remaining", "live", "lived", "living", "die", "died", "dying", "kill", "killed", "killing", "break", "broke", "breaking", "fall", "fell", "falling", "rise", "rose", "rising", "grow", "grew", "growing", "increase", "increased", "increasing", "decrease", "decreased", "decreasing", "change", "changed", "changing", "become", "became", "becoming", "appear", "appeared", "appearing", "disappear", "disappeared", "disappearing", "exist", "existed", "existing", "happen", "happened", "happening", "occur", "occurred", "occurring", "develop", "developed", "developing", "improve", "improved", "improving", "move", "moved", "moving", "work", "worked", "working", "play", "played", "playing", "rest", "rested", "resting", "exercise", "exercised", "exercising", "travel", "traveled", "traveling", "drive", "drove", "driving", "ride", "rode", "riding", "fly", "flew", "flying", "swim", "swam", "swimming",])
    stop_words = set(nltk_stopwords.words('english'))

    words = re.findall(r"[a-zA-Z0-9\-]+", text.lower())
    filtered_text = " ".join(word for word in words if word not in stop_words)
    return filtered_text

def chunk_text(text, max_words=WORDS_PER_CHUNK):
    words = text.split()
    for i in range(0, len(words), max_words):
        yield " ".join(words[i:i + max_words])

def summarize_text(text, sentences_count=SENTENCES_PER_SUMMARY):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LuhnSummarizer()
    summary_sentences = summarizer(parser.document, sentences_count)
    return " ".join(str(sentence) for sentence in summary_sentences)

def TFIDF(text):
    filtered_text = clean(text)
    mach = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tf_matrix = mach.fit_transform([filtered_text])
    print("[STATUS] TFIDF calculaiton done\n")
    features = mach.get_feature_names_out()
    global_maxes = np.asarray(tf_matrix.sum(axis=0)).flatten()
    top_indices = global_maxes.argsort()[::-1][:KEYWORD_LIMIT]
    top_keywords = {features[i]: float(global_maxes[i]) for i in top_indices}

    return top_keywords

def summarize_large_text(text):
    #Safely summarize long texts, skipping NaNs/non-strings.
    if pd.isna(text) or not isinstance(text, str) or text.strip() == "":
        return ""

    keywords = TFIDF(text)

    summaries = []
    for chunk in chunk_text(text):
        try:
            summaries.append(summarize_text(chunk))
            
        except Exception as e:
            print(f"[WARN] Summarization failed on chunk: {e}\n")
            continue
    return [" ".join(summaries),keywords]

# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(SCRIPT_DIR, "genre_classifier.pkl")

if len(sys.argv) < 3:
    print(json.dumps({"success": False, "error": "Usage: firstrun.py <file_path> <model_path>"}))
    sys.exit(1)

MODEL_PATH = sys.argv[2]

if not os.path.exists(MODEL_PATH):
    print(json.dumps({"success": False, "error": f"Model not found: {MODEL_PATH}"}))
    sys.exit(1)


data = joblib.load(MODEL_PATH)
state_dict = data["model_state"]
genres = data["genres"]
embedding_dim = data["embedding_dim"]
print("[STATUS] MODEL LOADED")

model = GenreClassifier(input_dim=embedding_dim, hidden_dim=256, num_labels=len(genres))
model.load_state_dict(state_dict)
model.eval()

print(f"[INFO] Loaded {len(genres)} genres | embedding_dim={embedding_dim} \n")

embedder = SentenceTransformer("all-MiniLM-L6-v2")
print("[STATUS] Embedder Loaded\n")

reader = PdfReader(file_path)
print("[STATUS] Reader Initialized\n")


num_pages = len(reader.pages)
print(f"[INFO]Total pages found:{num_pages}\n")

redpages = max(1, int(num_pages * FACTOR))
step = max(1, num_pages // redpages)
selected_pages = list(range(0, num_pages, step))[:redpages]

summarystring = ""

for i in selected_pages:
    page = reader.pages[i]
    text = page.extract_text()
    print(f"[STATUS] Extracting text from page {i + 1}\n")
    summarystring += text


SORTED_KEYWORDS = summarize_large_text(summarystring)

embedding = embedder.encode(SORTED_KEYWORDS[0])
embedding = np.array(embedding, dtype=np.float32)
print("[STATUS] Embedding complete\n")

if embedding.shape[0] != embedding_dim:
    raise ValueError(f"Embedding dimension mismatch: expected {embedding_dim}, got {embedding.shape[0]}")

x = torch.tensor(embedding).unsqueeze(0)

with torch.no_grad():
    preds = model(x).squeeze(0).numpy()

pred_dict = {genre: float(preds[i]) for i, genre in enumerate(genres)}

SORTED_SCORES = dict(sorted(pred_dict.items(), key=lambda kv: kv[1], reverse=True))

print("\n[INFO] Genre scores")
print(f"“{SORTED_KEYWORDS[0]}”\n")

output = {
    "success": True,
    "filename": os.path.basename(file_path),
    "summary": SORTED_KEYWORDS[0][:500],  # First 500 chars of summary
    "keywords": SORTED_KEYWORDS[1],  # Dict of keywords
    "genres": SORTED_SCORES,  # Dict of all genre scores
    "top_genre": max(SORTED_SCORES, key=SORTED_SCORES.get),  # Genre with highest score
    "top_genre_score": max(SORTED_SCORES.values()),  # Highest score value
    "confidence": float(max(SORTED_SCORES.values()))
}

print(json.dumps(output, indent=2))
sys.exit(0)
