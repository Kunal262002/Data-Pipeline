"""Flask application entrypoint for the data pipeline API."""
from flask import Flask
from flask_cors import CORS

from api import register_blueprints
from config import Config


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(config or Config)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    register_blueprints(app)

    @app.get("/")
    def root():
        return {"service": "Data Pipeline API", "docs": "/api/health"}

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host=app.config["HOST"], port=app.config["PORT"], debug=app.config["DEBUG"])

