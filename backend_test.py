#!/usr/bin/env python3
"""
NEXUS AI Backend API Testing Suite
Tests all backend endpoints for NEXUS AI - 7 Figure Ecommerce Intelligence System
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Any
import time

# Backend URL from environment configuration
BACKEND_URL = "https://nexus-scale-1.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class NexusBackendTester:
    def __init__(self):
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NEXUS-AI-Tester/1.0'
        })
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    Details: {details}")
        print()

    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health endpoint", True, f"Status: {data['status']}")
                    return True
                else:
                    self.log_test("Health endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Health endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats"""
        try:
            response = self.session.get(f"{API_BASE}/dashboard/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['total_sales', 'conversion_rate', 'active_products', 'winning_ads', 
                                 'daily_revenue', 'monthly_revenue', 'alerts']
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Dashboard stats endpoint", True, 
                                f"All required fields present. Active products: {data['active_products']}", data)
                    return True
                else:
                    self.log_test("Dashboard stats endpoint", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Dashboard stats endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Dashboard stats endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def test_dashboard_actions(self):
        """Test GET /api/dashboard/actions"""
        try:
            response = self.session.get(f"{API_BASE}/dashboard/actions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check first action structure
                    action = data[0]
                    required_fields = ['action_type', 'title', 'description', 'priority']
                    missing_fields = [field for field in required_fields if field not in action]
                    
                    if not missing_fields:
                        self.log_test("Dashboard actions endpoint", True, 
                                    f"Got {len(data)} actions. First action type: {action['action_type']}", data)
                        return True
                    else:
                        self.log_test("Dashboard actions endpoint", False, 
                                    f"Missing fields in action: {missing_fields}")
                else:
                    self.log_test("Dashboard actions endpoint", False, 
                                f"Expected list of actions, got: {type(data)}")
            else:
                self.log_test("Dashboard actions endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Dashboard actions endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def test_trending_products(self):
        """Test GET /api/products/trending"""
        try:
            response = self.session.get(f"{API_BASE}/products/trending", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check first product structure
                    product = data[0]
                    required_fields = ['id', 'name', 'category', 'price', 'viral_score', 
                                     'profit_score', 'competition_score', 'total_score']
                    missing_fields = [field for field in required_fields if field not in product]
                    
                    if not missing_fields:
                        self.log_test("Trending products endpoint", True, 
                                    f"Got {len(data)} products. Top product: {product['name']} (score: {product['total_score']})", 
                                    data)  # Return full data for further testing
                        return data
                    else:
                        self.log_test("Trending products endpoint", False, 
                                    f"Missing fields in product: {missing_fields}")
                else:
                    self.log_test("Trending products endpoint", False, 
                                f"Expected list of products, got: {type(data)}")
            else:
                self.log_test("Trending products endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Trending products endpoint", False, f"Request failed: {str(e)}")
        
        return None

    def test_single_product(self, product_id: str):
        """Test GET /api/products/{id}"""
        try:
            response = self.session.get(f"{API_BASE}/products/{product_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('id') == product_id:
                    self.log_test("Single product endpoint", True, 
                                f"Product found: {data['name']} (ID: {product_id})", data)
                    return True
                else:
                    self.log_test("Single product endpoint", False, 
                                f"ID mismatch: expected {product_id}, got {data.get('id')}")
            else:
                self.log_test("Single product endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Single product endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def test_ad_script_generation(self):
        """Test POST /api/ads/generate-script"""
        test_payload = {
            "product_name": "Lampe LED Coucher de Soleil Premium",
            "product_category": "Home & Living",
            "product_price": 34.99,
            "concept_type": "Problem Solution",
            "platform": "TikTok"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/ads/generate-script", 
                                       json=test_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                required_fields = ['hook', 'script', 'voiceover', 'scenes', 'captions', 'hashtags', 'cta']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Validate content types
                    validation_errors = []
                    
                    if not isinstance(data['scenes'], list):
                        validation_errors.append("scenes should be a list")
                    if not isinstance(data['captions'], list):
                        validation_errors.append("captions should be a list")
                    if not isinstance(data['hashtags'], list):
                        validation_errors.append("hashtags should be a list")
                    
                    if not validation_errors:
                        self.log_test("Ad script generation", True, 
                                    f"Generated script for {test_payload['product_name']}. Hook: '{data['hook'][:50]}...'", data)
                        return True
                    else:
                        self.log_test("Ad script generation", False, 
                                    f"Validation errors: {validation_errors}")
                else:
                    self.log_test("Ad script generation", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Ad script generation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Ad script generation", False, f"Request failed: {str(e)}")
        
        return False

    def test_chat_ai(self):
        """Test POST /api/chat"""
        test_payload = {
            "session_id": f"test-session-{int(time.time())}",
            "message": "Quel est le meilleur produit actuellement?"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/chat", 
                                       json=test_payload, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                
                if "response" in data and "session_id" in data:
                    if data["session_id"] == test_payload["session_id"]:
                        self.log_test("Chat AI endpoint", True, 
                                    f"AI responded: '{data['response'][:100]}...'", data)
                        return True
                    else:
                        self.log_test("Chat AI endpoint", False, 
                                    f"Session ID mismatch")
                else:
                    self.log_test("Chat AI endpoint", False, 
                                f"Missing required fields in response: {data}")
            else:
                self.log_test("Chat AI endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Chat AI endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def test_refresh_products(self):
        """Test POST /api/refresh-products"""
        try:
            response = self.session.post(f"{API_BASE}/refresh-products", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "count" in data:
                    if isinstance(data["count"], int) and data["count"] > 0:
                        self.log_test("Refresh products endpoint", True, 
                                    f"Refreshed {data['count']} products", data)
                        return True
                    else:
                        self.log_test("Refresh products endpoint", False, 
                                    f"Invalid count: {data['count']}")
                else:
                    self.log_test("Refresh products endpoint", False, 
                                f"Missing required fields: {data}")
            else:
                self.log_test("Refresh products endpoint", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Refresh products endpoint", False, f"Request failed: {str(e)}")
        
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting NEXUS AI Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Test 1: Health check
        health_ok = self.test_health_endpoint()
        
        # Test 2: Dashboard stats
        dashboard_stats_ok = self.test_dashboard_stats()
        
        # Test 3: Dashboard actions
        dashboard_actions_ok = self.test_dashboard_actions()
        
        # Test 4: Trending products (get IDs for further testing)
        products_data = self.test_trending_products()
        products_ok = products_data is not None
        
        # Test 5: Single product (if we have product IDs)
        single_product_ok = False
        if products_data and len(products_data) > 0:
            # Get just the ID from the first product
            product_id = products_data[0]['id']
            single_product_ok = self.test_single_product(product_id)
        else:
            self.log_test("Single product endpoint", False, "No product IDs available from trending products")
        
        # Test 6: Ad script generation
        ad_script_ok = self.test_ad_script_generation()
        
        # Test 7: Chat AI
        chat_ok = self.test_chat_ai()
        
        # Test 8: Refresh products
        refresh_ok = self.test_refresh_products()
        
        # Summary
        print("=" * 60)
        print("🎯 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical endpoints check
        critical_endpoints = [health_ok, dashboard_stats_ok, products_ok, ad_script_ok]
        critical_passed = sum(critical_endpoints)
        
        print(f"\n🔥 Critical Endpoints: {critical_passed}/4 working")
        
        if failed_tests > 0:
            print(f"\n💥 FAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    print(f"   • {test['test']}: {test['details']}")
        
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'critical_working': critical_passed == 4,
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = NexusBackendTester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if results['critical_working'] else 1)