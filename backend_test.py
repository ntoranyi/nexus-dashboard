"""
NEXUS AI backend endpoint tests.
Tests all endpoints under /api against http://localhost:8001 plus CORS validation
for the new ALLOWED_ORIGINS env support and Vercel regex.
"""
import sys
import requests

BASE = "http://localhost:8001"
RESULTS = []  # (name, ok, detail)


def record(name, ok, detail=""):
    RESULTS.append((name, ok, detail))
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name} :: {detail}")


def test_ping():
    try:
        r = requests.get(f"{BASE}/api/ping", timeout=10)
        ok = r.status_code == 200 and r.json() == {"pong": True}
        record("GET /api/ping", ok, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("GET /api/ping", False, f"exception: {e}")


def test_health():
    try:
        r = requests.get(f"{BASE}/api/health", timeout=10)
        body = r.json()
        ok = (
            r.status_code == 200
            and body.get("status") == "healthy"
            and "timestamp" in body
        )
        record("GET /api/health", ok, f"status={r.status_code} body={body}")
    except Exception as e:
        record("GET /api/health", False, f"exception: {e}")


def test_dashboard_stats():
    try:
        r = requests.get(f"{BASE}/api/dashboard/stats", timeout=10)
        body = r.json()
        required = {
            "total_sales", "conversion_rate", "active_products", "winning_ads",
            "daily_revenue", "monthly_revenue", "alerts",
        }
        ok = r.status_code == 200 and required.issubset(body.keys())
        record(
            "GET /api/dashboard/stats",
            ok,
            f"status={r.status_code} keys={sorted(body.keys()) if isinstance(body, dict) else body}",
        )
    except Exception as e:
        record("GET /api/dashboard/stats", False, f"exception: {e}")


def test_dashboard_actions():
    try:
        r = requests.get(f"{BASE}/api/dashboard/actions", timeout=10)
        body = r.json()
        ok = (
            r.status_code == 200
            and isinstance(body, list)
            and len(body) > 0
            and all(
                {"action_type", "title", "description", "priority"}.issubset(item.keys())
                for item in body
            )
        )
        record(
            "GET /api/dashboard/actions",
            ok,
            f"status={r.status_code} count={len(body) if isinstance(body, list) else 'N/A'}",
        )
    except Exception as e:
        record("GET /api/dashboard/actions", False, f"exception: {e}")


def test_products_trending():
    try:
        r = requests.get(f"{BASE}/api/products/trending", timeout=15)
        body = r.json()
        ok = (
            r.status_code == 200
            and isinstance(body, list)
            and len(body) > 0
            and all(
                {"id", "name", "viral_score", "profit_score", "competition_score", "total_score"}.issubset(p.keys())
                for p in body
            )
        )
        if ok:
            scores = [p["total_score"] for p in body]
            sorted_ok = scores == sorted(scores, reverse=True)
            record(
                "GET /api/products/trending",
                sorted_ok,
                f"status={r.status_code} count={len(body)} sorted_desc={sorted_ok}",
            )
        else:
            record(
                "GET /api/products/trending",
                False,
                f"status={r.status_code} body_type={type(body)}",
            )
    except Exception as e:
        record("GET /api/products/trending", False, f"exception: {e}")


def test_ads_generate_script():
    payload = {
        "product_name": "Mini Imprimante Photo",
        "product_category": "Electronics",
        "product_price": 39.99,
        "concept_type": "ugc",
        "platform": "tiktok",
    }
    try:
        r = requests.post(f"{BASE}/api/ads/generate-script", json=payload, timeout=120)
        body = r.json()
        required = {"id", "product_id", "concept_type", "hook", "script",
                    "voiceover", "scenes", "captions", "hashtags", "cta", "platform"}
        ok = r.status_code == 200 and required.issubset(body.keys())
        non_empty = ok and bool(body.get("hook")) and bool(body.get("script"))
        record(
            "POST /api/ads/generate-script",
            non_empty,
            f"status={r.status_code} hook={body.get('hook','')[:80]!r} platform={body.get('platform')}",
        )
    except Exception as e:
        record("POST /api/ads/generate-script", False, f"exception: {e}")


def test_chat():
    payload = {"session_id": "test-123", "message": "Trouve un produit gagnant"}
    try:
        r = requests.post(f"{BASE}/api/chat", json=payload, timeout=120)
        body = r.json()
        ok = (
            r.status_code == 200
            and "response" in body
            and body.get("session_id") == "test-123"
            and isinstance(body["response"], str)
            and len(body["response"]) > 0
            and body["response"] != "Erreur de connexion. Réessayez."
        )
        record(
            "POST /api/chat",
            ok,
            f"status={r.status_code} response_len={len(body.get('response','')) if isinstance(body, dict) else 'N/A'}",
        )
    except Exception as e:
        record("POST /api/chat", False, f"exception: {e}")


def _cors_check(origin, expect_match):
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
    }
    try:
        r = requests.options(f"{BASE}/api/health", headers=headers, timeout=10)
        acao = r.headers.get("access-control-allow-origin")
        if expect_match:
            ok = acao == origin
        else:
            ok = acao is None or (acao != origin and acao != "*")
        record(
            f"CORS preflight Origin={origin} expect_match={expect_match}",
            ok,
            f"status={r.status_code} ACAO={acao!r}",
        )
        r2 = requests.get(
            f"{BASE}/api/health", headers={"Origin": origin}, timeout=10
        )
        acao2 = r2.headers.get("access-control-allow-origin")
        if expect_match:
            ok2 = acao2 == origin
        else:
            ok2 = acao2 is None or (acao2 != origin and acao2 != "*")
        record(
            f"CORS GET Origin={origin} expect_match={expect_match}",
            ok2,
            f"status={r2.status_code} ACAO={acao2!r}",
        )
    except Exception as e:
        record(f"CORS Origin={origin}", False, f"exception: {e}")


def test_cors():
    _cors_check("https://nexus-ai.vercel.app", True)
    _cors_check("http://localhost:3000", True)
    _cors_check("https://evil.example.com", False)


def main():
    test_ping()
    test_health()
    test_dashboard_stats()
    test_dashboard_actions()
    test_products_trending()
    test_ads_generate_script()
    test_chat()
    test_cors()

    print("\n================ SUMMARY ================")
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    total = len(RESULTS)
    for name, ok, _ in RESULTS:
        print(f"{'PASS' if ok else 'FAIL'} - {name}")
    print(f"\n{passed}/{total} checks passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
