# 🤖 AI-Powered Learning Features

## Overview

Recalla now includes an intelligent, AI-powered word selection system that optimizes your learning experience. All AI processing runs **locally in your browser** - no external API calls, keeping the app lightweight and your data private.

## Key Features

### 1. 🧠 Spaced Repetition Algorithm

Based on the SuperMemo SM-2 algorithm, Recalla automatically calculates the optimal time to review each word:

- **New words**: Review frequently (every few minutes)
- **Familiar words**: Review less often (every few hours)
- **Mastered words**: Review occasionally (every few days)

The system adapts the interval based on your performance:
- Get it right consecutively? The interval increases
- Get it wrong? The interval resets

### 2. 📉 Forgetting Curve Modeling

Inspired by Ebbinghaus's forgetting curve research, the system predicts when you're likely to forget a word:

- Retention = e^(-time_since_review / stability)
- Stability increases with mastery
- Words approaching the forgetting threshold are prioritized

### 3. 🎯 Difficulty Estimation

The AI analyzes your performance to estimate word difficulty:

- **Error rate**: How often you get it wrong
- **Recent failures**: Recent mistakes increase priority
- **Consistency**: Tracks if you're improving or struggling

Difficulty levels:
- 🟢 **Easy** (0-30%): Words you consistently get right
- 🟡 **Medium** (31-60%): Words you're learning
- 🔴 **Hard** (61-100%): Words that need extra attention

### 4. 📈 Learning Velocity Tracking

Measures how quickly you're mastering each word:

- **Positive velocity**: Consecutive correct answers, improving mastery
- **Negative velocity**: More wrongs than rights, struggling
- **Neutral**: Not enough data yet

### 5. 🎲 Smart Word Selection

The game uses a priority-based selection algorithm that considers:

1. **Low retention** (40% weight): Words you're likely to forget
2. **High difficulty** (30% weight): Words you struggle with
3. **Low mastery** (20% weight): Words you haven't mastered
4. **Overdue for review** (10% weight): Words past their optimal review time

The algorithm also balances challenge:
- 70% high-priority (difficult) words
- 30% easier words for confidence building

### 6. 📊 Visual Learning Insights

The app now displays AI-driven insights throughout:

#### In Statistics:
- **AI-Recommended Practice Words**: Top words needing attention
- **Mastery progress bars**: Visual indication of learning progress
- **Difficulty indicators**: See which words are hardest
- **Status badges**: 
  - ✨ New - Never practiced
  - 📚 Learning - In progress
  - 📈 Familiar - Almost mastered
  - 🎯 Challenging - Needs extra attention
  - ⭐ Mastered - Well learned

#### In Words List:
- **Status emoji** for each word
- **Mastery percentage** with progress bar
- **Learning status badge**

## How It Works

### Data Collection

Every time you play the match game, the system tracks:
- Whether you got the match correct or wrong
- Time taken (implicitly through game sessions)
- Consecutive correct/wrong answers
- Last practice time

### Real-Time Calculation

Before each game round, the AI:
1. Calculates retention probability for all words
2. Estimates difficulty based on your history
3. Checks which words are overdue for review
4. Assigns priority scores (0-1000)
5. Selects the optimal mix of words

### Continuous Learning

The system continuously adapts:
- **After each match**: Updates word statistics
- **Before each round**: Recalculates priorities
- **During gameplay**: Replaces matched cards with high-priority words
- **No manual tuning needed**: Everything is automatic

## Technical Implementation

### Algorithms Used

1. **Spaced Repetition**: Inspired by SuperMemo SM-2
   ```
   intervals = [0.1, 0.5, 1, 3, 8, 24, 48, 96] hours
   adjusted_interval = base_interval * mastery_factor
   ```

2. **Forgetting Curve**: Based on Ebbinghaus model
   ```
   retention = e^(-hours_since_practice / stability)
   stability = 1 + (mastery_score / 100) * 47
   ```

3. **Difficulty Estimation**:
   ```
   difficulty = (error_rate * 0.7) + (consecutive_fails * 0.3)
   ```

4. **Priority Scoring**:
   ```
   priority = (1 - retention) * 400 + 
              (difficulty / 100) * 300 + 
              (1 - mastery / 100) * 200 + 
              (is_overdue ? 100 : 0)
   ```

### Performance

- **Bundle size**: ~392KB JS (gzipped: 124KB)
- **Execution time**: <5ms per word selection
- **Memory usage**: Minimal (< 1MB for typical vocabulary)
- **Zero external dependencies**: Pure JavaScript implementation

## Benefits

1. **Personalized Learning**: Adapts to your unique learning pace
2. **Efficient Practice**: Focus on words that need attention
3. **Better Retention**: Scientifically-backed spaced repetition
4. **Motivation**: Visual progress keeps you engaged
5. **Privacy**: All data stays on your device
6. **Lightweight**: No AI model downloads or API calls

## Future Enhancements

Potential improvements for future versions:

- **Session analytics**: Track learning patterns over time
- **Optimal study time**: Suggest best times to practice
- **Advanced insights**: Learning curve predictions
- **Custom algorithms**: User-configurable learning strategies
- **Export learning data**: Download your progress for analysis

## References

- SuperMemo SM-2 Algorithm
- Ebbinghaus Forgetting Curve
- Spaced Repetition Research
- Cognitive Science Learning Principles

---

**Note**: This AI system is designed to be lightweight and run entirely in your browser, using cognitive science principles rather than machine learning models. It's "AI-inspired" rather than traditional ML-based AI, making it fast, private, and efficient.
