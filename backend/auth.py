from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

bp = Blueprint('auth', __name__)
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    records = db.relationship('PulseRecord', backref='user', lazy=True)

class PulseRecord(db.Model):
    __tablename__ = 'pulse_records'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    raw_input = db.Column(db.JSON, nullable=False)
    dosha_scores = db.Column(db.JSON, nullable=False)
    result_dosha = db.Column(db.String(32), nullable=False)

@bp.record_once
def setup_db(state):
    db.init_app(state.app)
    with state.app.app_context():
        db.create_all()

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    hashed = generate_password_hash(password)
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    user = User(email=email, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User registered'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token})

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'id': user.id, 'email': user.email})

@bp.route('/records', methods=['POST'])
@jwt_required()
def add_record():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    raw_input = data.get('raw_input')
    dosha_scores = data.get('dosha_scores')
    result_dosha = data.get('result_dosha')
    if not (raw_input and dosha_scores and result_dosha):
        return jsonify({'error': 'Missing fields'}), 400
    record = PulseRecord(
        user_id=user.id,
        raw_input=raw_input,
        dosha_scores=dosha_scores,
        result_dosha=result_dosha
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({'msg': 'Record added', 'record_id': record.id}), 201

@bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    records = PulseRecord.query.filter_by(user_id=user.id).order_by(PulseRecord.timestamp.desc()).all()
    return jsonify([
        {
            'id': r.id,
            'timestamp': r.timestamp.isoformat(),
            'raw_input': r.raw_input,
            'dosha_scores': r.dosha_scores,
            'result_dosha': r.result_dosha
        } for r in records
    ]) 