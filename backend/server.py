from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import random
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexus_ai')]

# LLM Key - Using Anthropic Claude
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

app = FastAPI(title="NEXUS AI - 7 Figure Ecommerce Intelligence")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ======================= MODELS =======================

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    price: float
    cost: float
    image_url: Optional[str] = None
    viral_score: int = Field(default=0, ge=0, le=100)
    profit_score: int = Field(default=0, ge=0, le=100)
    competition_score: int = Field(default=0, ge=0, le=100)
    total_score: int = Field(default=0, ge=0, le=100)
    source: str = "Minea"
    views: int = 0
    engagement: float = 0.0
    market_saturation: str = "Low"
    potential_regions: List[str] = ["Europe", "USA"]
    trending_since: Optional[datetime] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    cost: float
    image_url: Optional[str] = None

class AdScript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    concept_type: str  # Problem Solution, Lifestyle, Demonstration
    hook: str
    script: str
    voiceover: str
    scenes: List[str]
    captions: List[str]
    hashtags: List[str]
    cta: str
    platform: str  # TikTok, Meta, Instagram
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdScriptCreate(BaseModel):
    product_id: str
    concept_type: str
    platform: str

class DailyAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str  # scale, launch, stop, optimize
    title: str
    description: str
    priority: str  # high, medium, low
    product_name: Optional[str] = None
    recommended_budget: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_sales: float
    conversion_rate: float
    active_products: int
    winning_ads: int
    daily_revenue: float
    monthly_revenue: float
    top_product: Optional[str] = None
    alerts: List[str] = []

class GenerateScriptRequest(BaseModel):
    product_name: str
    product_category: str
    product_price: float
    concept_type: str
    platform: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: str
    message: str

# ======================= MOCK DATA GENERATOR =======================

def generate_trending_products():
    """Generate simulated trending products like Minea/Kalodata"""
    products_data = [
        {"name": "Lampe LED Coucher de Soleil", "category": "Home & Living", "price": 29.99, "cost": 8.50},
        {"name": "Massage Gun Pro", "category": "Health & Fitness", "price": 79.99, "cost": 22.00},
        {"name": "Organisateur Maquillage Rotatif", "category": "Beauty", "price": 34.99, "cost": 9.00},
        {"name": "Écouteurs Sans Fil TWS", "category": "Electronics", "price": 49.99, "cost": 12.00},
        {"name": "Bouteille Eau Intelligente", "category": "Lifestyle", "price": 39.99, "cost": 11.00},
        {"name": "Projecteur Galaxie", "category": "Home & Living", "price": 44.99, "cost": 13.00},
        {"name": "Correcteur de Posture", "category": "Health & Fitness", "price": 24.99, "cost": 6.50},
        {"name": "Ring Light Professionnel", "category": "Electronics", "price": 54.99, "cost": 15.00},
        {"name": "Gants Chauffants USB", "category": "Fashion", "price": 19.99, "cost": 5.00},
        {"name": "Mini Imprimante Photo", "category": "Electronics", "price": 89.99, "cost": 28.00},
        {"name": "Tapis Yoga Antidérapant", "category": "Health & Fitness", "price": 29.99, "cost": 7.00},
        {"name": "Chargeur Sans Fil 3-en-1", "category": "Electronics", "price": 44.99, "cost": 14.00},
    ]
    
    sources = ["Minea", "Kalodata", "PipiAds", "TikTok Creative Center"]
    saturation_levels = ["Low", "Medium", "High"]
    regions = [["Europe", "USA"], ["Europe"], ["USA"], ["Europe", "USA", "Asia"]]
    
    products = []
    for p in products_data:
        viral = random.randint(60, 98)
        profit = random.randint(50, 95)
        competition = random.randint(30, 85)
        total = int((viral * 0.4) + (profit * 0.35) + ((100 - competition) * 0.25))
        
        product = Product(
            name=p["name"],
            category=p["category"],
            price=p["price"],
            cost=p["cost"],
            viral_score=viral,
            profit_score=profit,
            competition_score=competition,
            total_score=total,
            source=random.choice(sources),
            views=random.randint(100000, 5000000),
            engagement=round(random.uniform(3.5, 12.5), 2),
            market_saturation=random.choice(saturation_levels),
            potential_regions=random.choice(regions),
            trending_since=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        products.append(product)
    
    return sorted(products, key=lambda x: x.total_score, reverse=True)

def generate_daily_actions(products: List[Product]):
    """Generate CEO daily actions based on products"""
    actions = []
    
    if products:
        top_product = products[0]
        actions.append(DailyAction(
            action_type="scale",
            title=f"Scaler {top_product.name}",
            description=f"Score total: {top_product.total_score}/100. Augmenter budget ads de 50%.",
            priority="high",
            product_name=top_product.name,
            recommended_budget=500.0
        ))
        
        if len(products) > 1:
            actions.append(DailyAction(
                action_type="launch",
                title=f"Lancer campagne {products[1].name}",
                description=f"Viral score: {products[1].viral_score}/100. Créer 3 creatives TikTok.",
                priority="high",
                product_name=products[1].name,
                recommended_budget=200.0
            ))
        
        low_performers = [p for p in products if p.total_score < 60]
        if low_performers:
            actions.append(DailyAction(
                action_type="stop",
                title=f"Stopper {low_performers[0].name}",
                description=f"Score faible: {low_performers[0].total_score}/100. Réallouer budget.",
                priority="medium",
                product_name=low_performers[0].name
            ))
    
    actions.append(DailyAction(
        action_type="optimize",
        title="Optimiser campagnes actives",
        description="Analyser CPA et ROAS. Ajuster audiences.",
        priority="medium",
        recommended_budget=100.0
    ))
    
    return actions

# ======================= API ENDPOINTS =======================

@api_router.get("/")
async def root():
    return {"message": "NEXUS AI - 7 Figure Ecommerce Intelligence System", "status": "active"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Dashboard Endpoints
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get CEO dashboard statistics"""
    products = await db.products.find().to_list(100)
    
    stats = DashboardStats(
        total_sales=random.uniform(50000, 150000),
        conversion_rate=round(random.uniform(2.5, 5.5), 2),
        active_products=len(products) if products else 12,
        winning_ads=random.randint(5, 15),
        daily_revenue=random.uniform(2000, 8000),
        monthly_revenue=random.uniform(50000, 150000),
        top_product=products[0]["name"] if products else "Lampe LED Coucher de Soleil",
        alerts=[
            "Stock bas: Massage Gun Pro (15 unités)",
            "CPA élevé: Campagne TikTok #3",
            "Nouveau produit trending détecté"
        ]
    )
    return stats

@api_router.get("/dashboard/actions", response_model=List[DailyAction])
async def get_daily_actions():
    """Get CEO daily priority actions"""
    products_cursor = await db.products.find().sort("total_score", -1).to_list(20)
    products = [Product(**p) for p in products_cursor] if products_cursor else generate_trending_products()[:5]
    return generate_daily_actions(products)

# Product Research Endpoints
@api_router.get("/products/trending", response_model=List[Product])
async def get_trending_products():
    """Get trending products (Minea/Kalodata style)"""
    products_cursor = await db.products.find().sort("total_score", -1).to_list(20)
    
    if not products_cursor:
        # Generate and store mock trending products
        products = generate_trending_products()
        for p in products:
            await db.products.insert_one(p.dict())
        return products
    
    return [Product(**p) for p in products_cursor]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product details"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Add custom product to track"""
    product = Product(
        name=product_data.name,
        category=product_data.category,
        price=product_data.price,
        cost=product_data.cost,
        image_url=product_data.image_url,
        viral_score=random.randint(40, 80),
        profit_score=int(((product_data.price - product_data.cost) / product_data.price) * 100),
        competition_score=random.randint(30, 70),
    )
    product.total_score = int((product.viral_score * 0.4) + (product.profit_score * 0.35) + ((100 - product.competition_score) * 0.25))
    
    await db.products.insert_one(product.dict())
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Ad Scripts Generation Endpoints
@api_router.post("/ads/generate-script", response_model=AdScript)
async def generate_ad_script(request: GenerateScriptRequest):
    """Generate viral ad script using AI"""
    
    concept_prompts = {
        "Problem Solution": f"""Crée un script publicitaire TikTok/Meta pour '{request.product_name}' (catégorie: {request.product_category}, prix: {request.product_price}€).
        
        Format PROBLEM SOLUTION:
        - Hook accrocheur (3 sec max)
        - Problème relatable
        - Solution = le produit
        - Bénéfices clés
        - CTA urgent
        
        Réponds en JSON avec: hook, script, voiceover, scenes (liste), captions (liste), hashtags (liste), cta""",
        
        "Lifestyle": f"""Crée un script publicitaire TikTok/Meta pour '{request.product_name}' (catégorie: {request.product_category}, prix: {request.product_price}€).
        
        Format LIFESTYLE:
        - Hook aspirationnel (3 sec max)
        - Montrer vie avec le produit
        - Émotion positive
        - Social proof subtle
        - CTA doux mais efficace
        
        Réponds en JSON avec: hook, script, voiceover, scenes (liste), captions (liste), hashtags (liste), cta""",
        
        "Demonstration": f"""Crée un script publicitaire TikTok/Meta pour '{request.product_name}' (catégorie: {request.product_category}, prix: {request.product_price}€).
        
        Format DEMONSTRATION:
        - Hook curiosité (3 sec max)
        - Unboxing/Reveal
        - Features en action
        - Résultat impressionnant
        - CTA avec offre
        
        Réponds en JSON avec: hook, script, voiceover, scenes (liste), captions (liste), hashtags (liste), cta"""
    }
    
    prompt = concept_prompts.get(request.concept_type, concept_prompts["Problem Solution"])
    
    try:
        if ANTHROPIC_API_KEY:
            chat = LlmChat(
                api_key=ANTHROPIC_API_KEY,
                session_id=f"nexus-ads-{uuid.uuid4()}",
                system_message="Tu es un expert en publicité ecommerce. Tu crées des scripts viraux pour TikTok et Meta. Réponds uniquement en JSON valide."
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse AI response
            import json
            try:
                # Try to extract JSON from response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    raw_data = json.loads(response[json_start:json_end])
                    
                    # Helper to convert complex objects to strings
                    def to_string(val):
                        if isinstance(val, str):
                            return val
                        elif isinstance(val, dict):
                            return json.dumps(val, ensure_ascii=False) if len(val) > 3 else " - ".join(str(v) for v in val.values())
                        elif isinstance(val, list):
                            return [to_string(item) for item in val]
                        return str(val)
                    
                    def to_string_list(val):
                        if isinstance(val, list):
                            return [to_string(item) if isinstance(item, (dict, list)) else str(item) for item in val]
                        return [str(val)]
                    
                    ai_data = {
                        "hook": to_string(raw_data.get("hook", "")) if isinstance(raw_data.get("hook"), str) else str(raw_data.get("hook", "")),
                        "script": to_string(raw_data.get("script", "")) if isinstance(raw_data.get("script"), str) else json.dumps(raw_data.get("script", {}), ensure_ascii=False),
                        "voiceover": to_string(raw_data.get("voiceover", "")) if isinstance(raw_data.get("voiceover"), str) else " | ".join([v.get("text", str(v)) if isinstance(v, dict) else str(v) for v in raw_data.get("voiceover", [])]),
                        "scenes": to_string_list(raw_data.get("scenes", [])),
                        "captions": to_string_list(raw_data.get("captions", [])),
                        "hashtags": to_string_list(raw_data.get("hashtags", [])),
                        "cta": to_string(raw_data.get("cta", "")) if isinstance(raw_data.get("cta"), str) else raw_data.get("cta", {}).get("primary", str(raw_data.get("cta", "")))
                    }
                else:
                    raise ValueError("No JSON found")
            except Exception as parse_err:
                logger.warning(f"JSON parse warning: {parse_err}")
                ai_data = {
                    "hook": "Ce produit a changé ma vie!",
                    "script": response[:500] if response else "Script généré",
                    "voiceover": "Découvrez le produit qui fait le buzz...",
                    "scenes": ["Scene 1: Hook", "Scene 2: Problem", "Scene 3: Solution", "Scene 4: CTA"],
                    "captions": ["POV: Tu découvres ce produit", "Resultat après 1 semaine"],
                    "hashtags": ["#tiktokmademebuyit", "#viral", "#musthave"],
                    "cta": "Lien en bio - Stock limité!"
                }
        else:
            # Fallback without AI
            ai_data = {
                "hook": f"POV: Tu découvres {request.product_name} 🔥",
                "script": f"Arrête de scroller! Ce {request.product_name} va changer ta vie. Problème résolu en 2 secondes. Regarde ça...",
                "voiceover": f"J'ai trouvé LE produit dont tout le monde parle sur TikTok. {request.product_name} à seulement {request.product_price}€.",
                "scenes": ["Hook attention", "Problème relatable", "Unboxing produit", "Démonstration", "Résultat wow", "CTA urgent"],
                "captions": ["POV: Tu trouves LE produit", "Résultat après 1 utilisation", "Je suis obsédé(e)"],
                "hashtags": ["#tiktokmademebuyit", "#viral", "#musthave", f"#{request.product_category.lower().replace(' ', '')}"],
                "cta": "🔗 Lien en bio - Stock TRÈS limité!"
            }
        
        ad_script = AdScript(
            product_id=str(uuid.uuid4()),
            concept_type=request.concept_type,
            hook=ai_data.get("hook", ""),
            script=ai_data.get("script", ""),
            voiceover=ai_data.get("voiceover", ""),
            scenes=ai_data.get("scenes", []),
            captions=ai_data.get("captions", []),
            hashtags=ai_data.get("hashtags", []),
            cta=ai_data.get("cta", ""),
            platform=request.platform
        )
        
        await db.ad_scripts.insert_one(ad_script.dict())
        return ad_script
        
    except Exception as e:
        logger.error(f"Error generating script: {e}")
        # Return fallback script
        ad_script = AdScript(
            product_id=str(uuid.uuid4()),
            concept_type=request.concept_type,
            hook=f"Ce {request.product_name} fait le BUZZ! 🔥",
            script=f"Découvre pourquoi tout le monde parle de {request.product_name}. Résultats incroyables garantis.",
            voiceover=f"Le produit viral du moment: {request.product_name}",
            scenes=["Hook", "Problem", "Solution", "Demo", "CTA"],
            captions=["POV: Tu découvres ce produit", "Game changer!"],
            hashtags=["#viral", "#tiktokmademebuyit", "#musthave"],
            cta="Lien en bio - Offre limitée!",
            platform=request.platform
        )
        await db.ad_scripts.insert_one(ad_script.dict())
        return ad_script

@api_router.get("/ads/scripts", response_model=List[AdScript])
async def get_ad_scripts(product_id: Optional[str] = None):
    """Get generated ad scripts"""
    query = {"product_id": product_id} if product_id else {}
    scripts = await db.ad_scripts.find(query).sort("created_at", -1).to_list(50)
    return [AdScript(**s) for s in scripts]

# AI Chat Assistant
@api_router.post("/chat")
async def chat_with_nexus(request: ChatRequest):
    """Chat with NEXUS AI assistant"""
    
    # Store user message
    user_msg = ChatMessage(
        session_id=request.session_id,
        role="user",
        content=request.message
    )
    await db.chat_messages.insert_one(user_msg.dict())
    
    # Get chat history
    history = await db.chat_messages.find({"session_id": request.session_id}).sort("created_at", 1).to_list(20)
    
    system_prompt = """Tu es NEXUS AI, un assistant expert en ecommerce 7 figures.
    Tu aides les entrepreneurs à:
    - Trouver des produits gagnants
    - Créer des publicités virales
    - Scaler leurs boutiques Shopify
    - Optimiser leur ROI publicitaire
    
    Ton ton est: professionnel, stratégique, orienté résultats, mentalité CEO.
    Réponds toujours en français de manière actionnable et concise."""
    
    try:
        if ANTHROPIC_API_KEY:
            chat = LlmChat(
                api_key=ANTHROPIC_API_KEY,
                session_id=request.session_id,
                system_message=system_prompt
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            user_message = UserMessage(text=request.message)
            response = await chat.send_message(user_message)
        else:
            response = "NEXUS AI est prêt à vous aider. Configurez votre clé API pour des réponses personnalisées."
        
        # Store assistant response
        assistant_msg = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=response
        )
        await db.chat_messages.insert_one(assistant_msg.dict())
        
        return {"response": response, "session_id": request.session_id}
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": "Erreur de connexion. Réessayez.", "session_id": request.session_id}

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for session"""
    messages = await db.chat_messages.find({"session_id": session_id}).sort("created_at", 1).to_list(100)
    return [{"role": m["role"], "content": m["content"], "created_at": m["created_at"]} for m in messages]

# Refresh/Reset data
@api_router.post("/refresh-products")
async def refresh_trending_products():
    """Refresh trending products data"""
    await db.products.delete_many({})
    products = generate_trending_products()
    for p in products:
        await db.products.insert_one(p.dict())
    return {"message": f"Refreshed {len(products)} trending products", "count": len(products)}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
