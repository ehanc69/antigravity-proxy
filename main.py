import os

from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return (
        "Project: acquired-jet-478701-b3<br>"
        "Status: Ready for takeoff.<br><br>"
        "Initiating Antigravity sequence...<br>"
        "<script>setTimeout(function(){window.location.href='https://xkcd.com/353/';}, 1500);</script>"
    )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
