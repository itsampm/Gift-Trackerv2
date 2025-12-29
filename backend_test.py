import requests
import sys
import json
from datetime import datetime, date
import base64

class BirthdayTrackerAPITester:
    def __init__(self, base_url="https://birthday-log.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_kids = []
        self.created_gifts = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_create_kid(self, name, birthday, interests=None):
        """Test creating a kid"""
        kid_data = {
            "name": name,
            "birthday": birthday,
            "interests": interests
        }
        success, response = self.run_test(
            f"Create Kid - {name}",
            "POST",
            "kids",
            200,
            data=kid_data
        )
        if success and 'id' in response:
            self.created_kids.append(response['id'])
            return response['id']
        return None

    def test_get_kids(self):
        """Test getting all kids"""
        success, response = self.run_test(
            "Get All Kids",
            "GET",
            "kids",
            200
        )
        return success, response

    def test_get_kid_by_id(self, kid_id):
        """Test getting a specific kid"""
        success, response = self.run_test(
            f"Get Kid by ID - {kid_id}",
            "GET",
            f"kids/{kid_id}",
            200
        )
        return success, response

    def test_update_kid(self, kid_id, update_data):
        """Test updating a kid"""
        success, response = self.run_test(
            f"Update Kid - {kid_id}",
            "PUT",
            f"kids/{kid_id}",
            200,
            data=update_data
        )
        return success, response

    def test_create_gift(self, kid_id, gift_name, occasion="birthday", year=2024):
        """Test creating a gift"""
        gift_data = {
            "kid_id": kid_id,
            "occasion": occasion,
            "year": year,
            "gift_name": gift_name,
            "date_given": "2024-01-15"
        }
        success, response = self.run_test(
            f"Create Gift - {gift_name}",
            "POST",
            "gifts",
            200,
            data=gift_data
        )
        if success and 'id' in response:
            self.created_gifts.append(response['id'])
            return response['id']
        return None

    def test_get_gifts_by_kid(self, kid_id):
        """Test getting gifts for a specific kid"""
        success, response = self.run_test(
            f"Get Gifts for Kid - {kid_id}",
            "GET",
            f"gifts/kid/{kid_id}",
            200
        )
        return success, response

    def test_get_all_gifts(self):
        """Test getting all gifts"""
        success, response = self.run_test(
            "Get All Gifts",
            "GET",
            "gifts",
            200
        )
        return success, response

    def test_delete_gift(self, gift_id):
        """Test deleting a gift"""
        success, response = self.run_test(
            f"Delete Gift - {gift_id}",
            "DELETE",
            f"gifts/{gift_id}",
            200
        )
        return success, response

    def test_delete_kid(self, kid_id):
        """Test deleting a kid"""
        success, response = self.run_test(
            f"Delete Kid - {kid_id}",
            "DELETE",
            f"kids/{kid_id}",
            200
        )
        return success, response

    def test_get_reminders(self):
        """Test getting birthday reminders"""
        success, response = self.run_test(
            "Get Birthday Reminders",
            "GET",
            "reminders",
            200
        )
        return success, response

    def test_photo_upload(self):
        """Test photo upload functionality"""
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGbfrGuwAAAABJRU5ErkJggg==')
        
        files = {'file': ('test.png', test_image_data, 'image/png')}
        success, response = self.run_test(
            "Upload Photo",
            "POST",
            "upload",
            200,
            files=files
        )
        return success, response

    def cleanup(self):
        """Clean up created test data"""
        print(f"\n🧹 Cleaning up test data...")
        
        # Delete created gifts
        for gift_id in self.created_gifts:
            self.test_delete_gift(gift_id)
        
        # Delete created kids
        for kid_id in self.created_kids:
            self.test_delete_kid(kid_id)

def main():
    print("🎂 Starting Birthday Tracker API Tests...")
    tester = BirthdayTrackerAPITester()

    try:
        # Test photo upload first
        print("\n📸 Testing Photo Upload...")
        upload_success, upload_response = tester.test_photo_upload()
        
        # Test kids CRUD operations
        print("\n👶 Testing Kids Management...")
        
        # Create test kids
        kid1_id = tester.test_create_kid("Alice Johnson", "2015-06-15", "Loves unicorns and drawing")
        kid2_id = tester.test_create_kid("Bob Smith", "2018-12-03", "Enjoys building blocks and cars")
        
        if not kid1_id or not kid2_id:
            print("❌ Failed to create test kids, stopping tests")
            return 1

        # Test getting all kids
        get_kids_success, kids_data = tester.test_get_kids()
        
        # Test getting individual kids
        tester.test_get_kid_by_id(kid1_id)
        tester.test_get_kid_by_id(kid2_id)
        
        # Test updating a kid
        update_data = {"interests": "Updated interests: loves art and music"}
        tester.test_update_kid(kid1_id, update_data)

        # Test gifts CRUD operations
        print("\n🎁 Testing Gifts Management...")
        
        # Create test gifts
        gift1_id = tester.test_create_gift(kid1_id, "Unicorn Plushie", "birthday", 2024)
        gift2_id = tester.test_create_gift(kid1_id, "Art Set", "christmas", 2023)
        gift3_id = tester.test_create_gift(kid2_id, "LEGO Set", "birthday", 2024)
        
        # Test getting gifts by kid
        tester.test_get_gifts_by_kid(kid1_id)
        tester.test_get_gifts_by_kid(kid2_id)
        
        # Test getting all gifts
        tester.test_get_all_gifts()

        # Test reminders
        print("\n⏰ Testing Birthday Reminders...")
        reminders_success, reminders_data = tester.test_get_reminders()
        
        if reminders_success:
            print(f"Found {len(reminders_data)} reminders")
            for reminder in reminders_data:
                print(f"  - {reminder.get('kid_name')}: {reminder.get('days_until')} days until birthday")

        # Test edge cases
        print("\n🔍 Testing Edge Cases...")
        
        # Test getting non-existent kid
        tester.run_test("Get Non-existent Kid", "GET", "kids/non-existent-id", 404)
        
        # Test creating kid with missing data
        tester.run_test("Create Kid Missing Data", "POST", "kids", 422, data={"name": "Test"})
        
        # Test deleting non-existent gift
        tester.run_test("Delete Non-existent Gift", "DELETE", "gifts/non-existent-id", 404)

    finally:
        # Cleanup
        tester.cleanup()

    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())