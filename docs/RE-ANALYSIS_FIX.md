# Re-Analysis Fix: Prevent Content Accumulation

## Problem
When users clicked "Re-Analyze," the system was accumulating content from previous conversation sessions. The refined prompt would include not just the current prompt text and user's optional additions, but also generated text from Echo's previous responses.

## Root Cause
The issue occurred in the `AnalysisPreparator` service (`server/services/preparator.py`). The system prompt instructed the AI to "incorporate suggestions from the conversation," which caused it to **add** the assistant's previous responses into the refined prompt, rather than just using them as **context** for understanding what improvements to make.

### The Flow:
1. User has a conversation with Echo about prompt improvements
2. User clicks "Re-Analyze"
3. Frontend calls `/prepare/prepare` endpoint with:
   - Current prompt
   - Prior analysis (violations, risk tokens)
   - **Full conversation history** (including all assistant responses)
   - User's optional additions
4. The preparator service would **include text from the conversation** in the refined prompt
5. This caused the prompt to grow with each re-analysis

## Solution

### 1. Updated System Prompt (preparator.py)
**Changed the instructions to be explicit:**

```python
CRITICAL RULES:
- Start with the CURRENT PROMPT as your base text
- DO NOT add content from the assistant's previous responses or suggestions
- The conversation history is for CONTEXT ONLY - to understand what the user wants
- Only make changes to FIX the identified hallucination risks
- Add the user's final edits if provided
- DO NOT expand, elaborate, or add new requirements beyond fixing risks
```

**Old behavior:** "Incorporate suggestions from the conversation"
**New behavior:** "Use conversation for CONTEXT ONLY - do not copy text from it"

### 2. Updated Conversation Formatting
**Added explicit warning in the conversation context:**

```python
def _format_conversation(self, history: List[Dict[str, str]]) -> str:
    """Format conversation history for context only - not for copying into prompt."""
    if not history:
        return "(No prior conversation)"
    
    formatted = ["(Context: This is what was discussed - DO NOT copy this text into the prompt)"]
    # ... rest of formatting
```

### 3. Verified Client-Side Cleanup
**Confirmed that `handleReanalyze` properly resets conversation state:**

```typescript
const handleReanalyze = async (refinedPrompt: string) => {
  // Update the prompt in the editor
  setCurrentPrompt(refinedPrompt);
  
  // Reset conversation ✅
  setChatMessages([]);
  setShowConversationWarning(false);
  
  // Trigger fresh analysis
  await handleAnalyze(currentHallucinationMode, refinedPrompt);
};
```

**And `handleAnalyze` also clears chat on each run:**

```typescript
const handleAnalyze = async (...) => {
  // Reset session ✅
  setChatMessages([]);
  // ... perform analysis
  // ... then create fresh initial rewrite message
};
```

## Expected Behavior After Fix

### ✅ Correct Flow:
1. User has conversation: "Make the prompt more specific about deadline"
2. User clicks "Re-Analyze" 
3. Optional: User adds "Also add a word count limit"
4. System generates refined prompt that:
   - ✅ Starts with the current prompt text
   - ✅ Fixes identified hallucination risks (e.g., adds deadline specification)
   - ✅ Includes user's additions (e.g., adds word count)
   - ✅ **Does NOT include** Echo's previous suggestions as text
5. Re-analysis starts with **fresh conversation**
6. New initial rewrite message is generated for the refined prompt

### ❌ Previous Incorrect Behavior:
The refined prompt would include text like:
```
Write a blog post about AI.

[Previous assistant suggestion text]
To make this prompt clearer, you should specify the audience, add word count...

[More accumulated text]
Consider adding temporal constraints...
```

### ✅ New Correct Behavior:
The refined prompt stays clean:
```
Write a blog post about AI for software developers. 
Target length: 1000-1500 words. 
Deadline: December 2025.
Include practical code examples.
```

## Files Modified

### Backend:
- `server/services/preparator.py`
  - Updated system prompt with CRITICAL RULES section
  - Modified `_format_conversation()` to add explicit warning
  - Clarified that conversation is CONTEXT ONLY

### Frontend:
- No changes needed (already implemented correctly)
  - `client/src/App.tsx` - `handleReanalyze()` clears chat messages ✅
  - `client/src/App.tsx` - `handleAnalyze()` clears chat messages ✅

## Testing Recommendations

1. **Basic Re-Analysis:**
   - Write a simple prompt: "Write a summary"
   - Analyze it
   - Have 2-3 conversation exchanges with Echo
   - Click Re-Analyze with no additions
   - **Verify:** Refined prompt should be similar length to original

2. **With User Additions:**
   - Write prompt: "Explain quantum computing"
   - Analyze and converse
   - Click Re-Analyze with addition: "Target audience: high school students"
   - **Verify:** Refined prompt includes audience but not conversation text

3. **Multiple Re-Analysis Cycles:**
   - Analyze → Converse → Re-Analyze
   - Repeat 3 times
   - **Verify:** Prompt doesn't grow exponentially with each cycle

## Technical Notes

**Why this approach works:**
- The conversation history provides **semantic context** for the AI to understand what improvements the user wants
- The prior analysis provides **specific issues** to fix (violations, risk tokens)
- The user's final edits provide **explicit additions**
- The system prompt explicitly forbids copying conversation text
- The conversation formatting includes a warning not to copy

**Why the previous approach failed:**
- "Incorporate suggestions" was ambiguous - could mean "understand and apply" OR "copy and paste"
- LLMs tend to be helpful and include context when asked to "incorporate" things
- Without explicit prohibition, the AI would add conversation content

## Related Documentation

- User Flow: `docs/user_flow.md`
- Architecture: `docs/architecture.md`
- API Documentation: `server/routes/prepare.py`
