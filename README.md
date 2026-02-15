# Vector-Shift

VectorShift Pipeline Builder - A React Flow based pipeline builder with simulated LLM and backend integration.

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# For Run Pipeline (LLM execution), set your OpenAI API key:
# Windows: set OPENAI_API_KEY=sk-...
# Linux/Mac: export OPENAI_API_KEY=sk-...
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

The frontend runs on http://localhost:3000 and proxies API requests to the backend at http://localhost:8000.

## Assessment Parts

### Part 1: Node Abstraction
- **BaseNode** (`nodes/BaseNode.js`): Shared wrapper for all nodes with configurable title, subtitle, variant, and left/right handles.
- **createNode** (`nodes/createNode.js`): Factory that builds new nodes from a config object.
- **Five demo nodes**: Data Transform, Condition, API Request, Embedding, Summarizer (plus Input, Output, LLM, Text).

### Part 2: Styling
- Dark slate theme with color-coded node variants (emerald, amber, violet, sky).
- Sidebar for adding nodes via drag-and-drop.
- Styled submit button and controls.

### Part 3: Text Node Logic
- Textarea grows with content (min height/width based on lines and column length).
- `{{ variable }}` syntax creates input handles for valid JS variable names on the left.

### Part 4: Backend Integration
- **Frontend**: `submit.js` POSTs nodes and edges to `/pipelines/parse`.
- **Backend**: Parses pipeline, returns `{ num_nodes, num_edges, is_dag }`; DAG check uses DFS cycle detection.
- Alert shows the result when the user clicks Submit.

### Run Pipeline (LLM Execution)
- **Run Pipeline** button executes Input → LLM → Output and shows the LLM response in the Output node.
- Requires `OPENAI_API_KEY` environment variable. Uses `gpt-4o-mini` by default.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to Render (or other platforms). The app uses a React frontend and FastAPI backend; both can be hosted on Render's free tier.
