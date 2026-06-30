from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import secrets
from dotenv import load_dotenv
import os
from back_end_ import backend
from google.oauth2 import id_token
from google.auth.transport import requests 
from werkzeug.security import generate_password_hash

app = Flask(__name__,  template_folder="template")
CORS(app)
app.secret_key = "stupid-stupid-face-go-away-loser-you-shouldnt-be-seeing-this-but-u-are-why-loser-I-HATE-YOU-"
load_dotenv()
GOOGLE_CLIENT_ID = "685847297841-jcdrgekp22mcoim0rae19mevcjbai7qc.apps.googleusercontent.com"



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False


app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

#print(app.config["MAIL_SERVER"], app.config["MAIL_DEFAULT_SENDER"])

mail=Mail(app)
@app.route("/")
def index():
    name = session.get("Users_name")
    return render_template("index.html", name=name)

@app.route("/change_pass.html")
def change_pass():
    return render_template("change_pass.html")

@app.route("/login.html")
def login():
    return render_template("login.html")

@app.route("/create.html")
def create():
    return render_template("create.html")

@app.route("/products.html")
def products():
    return render_template("products.html")


@app.route("/sign-in", methods=["POST"])
def form_submit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "<p>*No data received</p>"}), 400

    email = data.get("email")
    password = data.get("password")
    print(email,password)

    db = backend(email=email, password=password)
    
    if db.verify_user(email_column="email", password_column="password"):
        user_name = db.get_data_(target_column="name", search_column="email", search_value=email)
        session["User-name"] = user_name
        
        return jsonify({"status": "success", "redirect": url_for("index")})
    else:
        return jsonify({"error": "<p>*Invalid email or password</p>"})
    
@app.route("/create-acc", methods=["POST"])
def account_created():
    email = request.form.get("email")
    password = request.form.get("pass")
    name= request.form.get("name")
    db = backend(Name=name, Email=email, Password=generate_password_hash(password), Googlelogin=0)
    db.add_to_db()
    session["User-name"] = name 
    #print(session["User-name"])

    #print(f"password = {password}, email = {email}, name={name}")

    return redirect(url_for("index"))

@app.route("/api/info")
def send_to_js():
    name = session.get("User-name", "&&$H£")
    data = {"name": name}
    #print(name)
    return jsonify(data)
#/give ben rayquaza 

@app.route("/forgot.html")
def forgot():
    return render_template("forgot.html")

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"error": "Missing token"}), 400

        # Verify the token with Google
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # Token is valid! Grab user details
        email = id_info.get('email')
        name = id_info.get('name')

        # Log the user into the Flask session
        session['User-name'] = name

        db = backend(Name=name, Email=email, Googlelogin=1)
        db.add_to_db()
        
        return jsonify({"status": "success", "message": "Logged in successfully"}), 200

    except ValueError:
        # Invalid token signature
        return jsonify({"error": "Invalid token verification"}), 401




@app.route("/search-queury", methods=["POST"])
def search():
    try:
        data = request.get_json()
        print(data)
    except ValueError:
        # Invalid token signature
        return jsonify({"error": "Invalid token verification"}), 401
    return "<p>new</p>"

@app.route("/sign-out", methods=["POST"])
def sign_out():
    try:
        data = request.get_json()
        if data["signedOut"]:
            session["User-name"] = "&&$H£"
    except ValueError:
        return jsonify({"error": "Invalid token verification"}), 401
    return "<p>new</p>"

@app.route("/confirm.html")
def confirm_email():
    return render_template("confirm.html")

@app.route("/send-code", methods=["POST"])
def send_email():
    try:    
        email = request.form.get("email")
        session["code"] = generate_code()
        session["reset-pass-email"] = email
        
        # FIX 1: Fetch the sender manually right here to guarantee it exists
        sender_email = app.config.get('MAIL_USERNAME') or os.getenv('MAIL_USERNAME')
        
        msg = Message(
            subject="Hello from Flask!",
            sender=sender_email, # FIX 2: Explicitly pass the sender here
            recipients=[session["reset-pass-email"]],
            body="This is a plain text test email sent from a Flask application."
        )
        msg.html = f"<p>Your 6 digit code is {session['code']}</p>"
        
        # FIX 3: Wrap the send command inside the app context
        with app.app_context():
            mail.send(msg)
            
        #print("--> Email dispatch successful!")
        return redirect(url_for("confirm_email")) # Use url_for instead of raw string

    except Exception as e:
        #print(f"--> Error caught: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

def generate_code():
    code = str(100000 + secrets.randbelow(900000))
    return code

@app.route("/email-code", methods=["POST"])
def get_users_code():
    
    code = request.form.get("code")
    if code == session['code']:
        return redirect("change_pass.html")
    return jsonify({"error": "<p>*invlaid code</p>"}), 500


@app.route("/new_pass", methods=["POST"])
def change_password():
    email = session["reset-pass-email"]
    new_pass = request.form.get("password")
    db = backend()
    if db.update_data("Password", generate_password_hash(new_pass), "Email", email):
        return redirect("/")
    return jsonify({"error": "<p>no such email</p>"}), 500

if __name__ == "__main__":
    app.run(debug=True)