from flask import Flask, jsonify, render_template
import requests
import os
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

API_KEY = os.getenv("API_KEY")
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_fixtures(date):
    url = f"https://v3.football.api-sports.io/fixtures?date={date}"
    headers = {"x-apisports-key": API_KEY}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("API request failed:", e)
        return {"response": []}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/live-scores')
def live_scores():
    test_date = '2024-11-26'
    print("Fetching live scores for date:", test_date)

    data = get_fixtures(test_date)

    # Fallback if test date has no matches
    if not data.get("response"):
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
        print("No matches on test date. Trying yesterday:", yesterday)
        data = get_fixtures(yesterday)

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
