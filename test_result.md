#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "NEXUS AI - 7 Figure Ecommerce Intelligence System - Application mobile pour gérer et analyser boutiques Shopify avec recherche produits tendances, génération de publicités virales, et dashboard CEO"

backend:
  - task: "Health endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/health returns healthy status"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Health endpoint returns proper status with timestamp."

  - task: "Dashboard stats endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/dashboard/stats returns simulated KPIs (sales, conversion, products, alerts)"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Returns all required fields (total_sales, conversion_rate, active_products, winning_ads, daily_revenue, monthly_revenue, alerts). Currently shows 12 active products."

  - task: "Dashboard daily actions endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/dashboard/actions returns CEO priority actions"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Returns list of 4 daily actions with proper structure (action_type, title, description, priority). Actions include scale, launch, stop, optimize operations."

  - task: "Trending products endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/products/trending returns simulated products with scores"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Returns 12 trending products with complete data structure including viral_score, profit_score, competition_score, total_score. Products properly sorted by total_score."

  - task: "Ad script generation with AI"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "POST /api/ads/generate-script uses GPT-5.2 to generate viral ad scripts"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: AI script generation working with GPT-5.2. Returns complete ad script structure (hook, script, voiceover, scenes, captions, hashtags, cta). Generated viral-style French content for TikTok platform."

  - task: "Chat with NEXUS AI assistant"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/chat implemented, needs testing"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: NEXUS AI chat working with GPT-5.2. Responds in French with professional ecommerce expertise. Chat messages stored with session management."

  - task: "Refresh products endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "POST /api/refresh-products regenerates mock data"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Successfully refreshes 12 trending products. Clears existing data and generates new mock products with proper scores."

  - task: "Single product details endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: GET /api/products/{id} returns detailed product information. Tested with product ID from trending products list."

frontend:
  - task: "Dashboard CEO screen"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Dashboard displays KPIs, alerts, and priority actions - verified via screenshot"

  - task: "Products trending screen"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/products.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Products list shows scores and details - verified via screenshot"

  - task: "Ads generator screen"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/ads.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Ads generator UI working - verified via screenshot"

  - task: "AI assistant chat screen"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/assistant.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Assistant chat interface working - verified via screenshot"

  - task: "Product detail screen"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/product/[id].tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Product detail page implemented, needs testing navigation"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "MVP of NEXUS AI implemented. All 4 main screens working (Dashboard, Products, Ads, Assistant). Backend endpoints verified via curl. Frontend verified via screenshots. Need backend API testing to confirm all endpoints."
  - agent: "testing"
    message: "✅ ALL BACKEND APIs TESTED AND WORKING: Comprehensive testing completed with 100% success rate. All 8 endpoints verified including health, dashboard stats/actions, trending products, single product details, AI ad script generation, AI chat assistant, and product refresh. GPT-5.2 integrations working properly for both ad generation and chat. All data structures and responses are correct."
  - agent: "main"
    message: "✅ MIGRATION VITE WEB APP COMPLETE (May 8, 2026): Successfully migrated from Expo to React+Vite for Vercel deployment. Fixed white-screen issues: (1) Updated all type imports to use `import type` from `/src/types.ts` instead of api.ts (esbuild strips type-only re-exports), (2) Replaced `Youtube` icon (not in installed lucide-react@1.14.0) with `MonitorPlay as Youtube` alias. All 5 pages render correctly: Dashboard (KPIs, Revenue Logger, Launch Checklist), Content (YouTube channel + Calendar), Products (trending), Ads (AI generator), Assistant (Claude chat). Backend healthy on port 8001, Vite serving on port 3000. Ready for GitHub push."
  - agent: "main"
    message: "✅ STANDALONE VERCEL READINESS (May 8, 2026): Added VITE_API_URL env var support + offline fallback. (1) /src/lib/api.ts now reads import.meta.env.VITE_API_URL (defaults to /api). (2) Built-in mock data for products, daily actions, AI ad scripts, AI chat — auto-activates with 6s timeout when backend unreachable. (3) Production build verified: 283KB JS (88KB gzipped). (4) vercel.json + .env.example documented for Render/Railway backend deployment. Frontend now works STANDALONE on Vercel without backend, and seamlessly upgrades to live Claude AI when VITE_API_URL is set."
