from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import secrets
import json 
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

@app.route("/confirm.html")
def confirm_email():
    return render_template("confirm.html")


@app.route("/forgot.html")
def forgot():
    return render_template("forgot.html")





@app.route("/sign-in", methods=["POST"])
def form_submit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "<p>*No data received</p>"}), 400

    email = data.get("email")
    password = data.get("password")
    print(email,password)

    db = backend(email=email, password=password, db_file_name="clothes_store.db")
    
    if db.verify_user(email_column="email", password_column="password"):
        user_name = db.get_data_(target_column="name", search_column="email", search_value=email)
        session["User-name"] = user_name
        session["email"] = email 
        
        return jsonify({"status": "success", "redirect": url_for("index")})
    else:
        return jsonify({"error": "<p>*Invalid email or password</p>"})




@app.route("/create-acc", methods=["POST"])
def account_created():
    data = request.get_json()
    if not data:
        return jsonify({"error": "<p>*No registration data received</p>"}), 400

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    db = backend(Name=name, Email=email, Password=generate_password_hash(password), Googlelogin=0, db_file_name="clothes_store.db")
    
    if not db.add_to_db(primary_key="Email"):
        # HTTP 400 Bad Request makes response.ok evaluate to false, correctly triggering the error block
        return jsonify({"error": "<p>*This email is already in use. Please use a different email address.</p>"}), 400
        
    session["User-name"] = name 
    session["email"] = email 

    # Return a success JSON status accompanied by the URL to go to next
    return jsonify({"status": "success", "redirect": url_for("index")}), 200


def get_data_for_cart():
    cart = backend(db_file_name="clothes_store.db",table_name="cart" )
    user_email = session["email"]
    t_str = cart.get_data_("product_title", "email", user_email)
    p_str = cart.get_data_("product_price", "email", user_email)
    i_str = cart.get_data_("product_image", "email", user_email)
    ia_str = cart.get_data_("product_image_alt", "email", user_email)
    return {"title":t_str, "price":p_str, "image": i_str, "image_alt":ia_str}

@app.route("/api/info")
def send_to_js():
    name = session.get("User-name", "&&$H£")
    data = {"name": name,
            "cart_data": get_data_for_cart()}
    #print(name)
    return jsonify(data)
#/give ben rayquaza 



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

        db = backend(Name=name, Email=email, Googlelogin=1, db_file_name="clothes_store.db")
        db.add_to_db()
        
        return jsonify({"status": "success", "message": "Logged in successfully"}), 200

    except ValueError:
        # Invalid token signature
        return jsonify({"error": "Invalid token verification"}), 401

@app.route("/cart-data", methods=["POST"])
def add_to_cart_db():
    d = request.get_json()
    if d and d.get("data"):
        data = d["data"]
        user_email = session.get("email")
        
        target_title = data["title"]
        # How many total copies of this item the user wants in their cart
        desired_qty = int(data.get("quantity", 1)) 
        
        # 1. Base JSON lists if creating a brand-new cart for the user
        # This will repeat the item data based on the initial desired quantity
        title_json = json.dumps([target_title] * max(1, desired_qty))
        price_json = json.dumps([data["price"]] * max(1, desired_qty))
        image_json = json.dumps([data["image"]] * max(1, desired_qty))
        alt_json = json.dumps([data["alt_image"]] * max(1, desired_qty))
        
        cart = backend(
            db_file_name="clothes_store.db", 
            table_name="cart", 
            email=user_email, 
            product_title=title_json,
            product_price=price_json, 
            product_image=image_json,  
            product_image_alt=alt_json
        )
        
        # If the user already has a cart row, modify the duplicate entries inline
        if not cart.add_to_db(primary_key="Email"):
            t_str = cart.get_data_("product_title", "email", user_email)
            p_str = cart.get_data_("product_price", "email", user_email)
            i_str = cart.get_data_("product_image", "email", user_email)
            ia_str = cart.get_data_("product_image_alt", "email", user_email)
            
            t_list = json.loads(t_str) if t_str else []
            p_list = json.loads(p_str) if p_str else []
            i_list = json.loads(i_str) if i_str else []
            ia_list = json.loads(ia_str) if ia_str else []
            
            # 2. Count how many copies of this specific item are already in the lists
            current_qty = t_list.count(target_title)
            
            if desired_qty <= 0:
                # Remove ALL matching items from the lists if quantity is 0
                while target_title in t_list:
                    idx = t_list.index(target_title)
                    t_list.pop(idx)
                    p_list.pop(idx)
                    i_list.pop(idx)
                    ia_list.pop(idx)
            
            elif desired_qty > current_qty:
                # 3. Add more copies if the user increased the quantity
                number_to_add = desired_qty - current_qty
                for _ in range(number_to_add):
                    t_list.append(target_title)
                    p_list.append(data["price"])
                    i_list.append(data["image"])
                    ia_list.append(data["alt_image"])
                    
            elif desired_qty < current_qty:
                # 4. Remove excess copies if the user decreased the quantity
                number_to_remove = current_qty - desired_qty
                for _ in range(number_to_remove):
                    idx = t_list.index(target_title) # Finds the first instance
                    t_list.pop(idx)
                    p_list.pop(idx)
                    i_list.pop(idx)
                    ia_list.pop(idx)
            
            # 5. Save the updated arrays back to the database
            cart.update_data("product_title", json.dumps(t_list), "email", user_email)
            cart.update_data("product_price", json.dumps(p_list), "email", user_email)
            cart.update_data("product_image", json.dumps(i_list), "email", user_email)
            cart.update_data("product_image_alt", json.dumps(ia_list), "email", user_email)
            data = {"images":cart.get_data_("product_image", "email", session["email"]),
                    "title":cart.get_data_("product_title", "email", session["email"]),
                    "price": cart.get_data_("product_price", "email", session["email"]),
                    "alt-image":cart.get_data_("product_image_alt", "email", session["email"])}
        return jsonify({"status": "success", "cart_data":data}), 200
    else:
        return jsonify({"error": "dont- even know anymore"})
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
    return jsonify({"success": "worked"}), 200



@app.route("/send-code", methods=["POST"])
def send_email():
    try:    
        # 1. Parse incoming JSON data stream instead of HTML form parameters
        data = request.get_json()
        if not data or not data.get("email"):
            return jsonify({"error": "<p>*Please provide a valid email address.</p>"}), 400

        email = data.get("email")
        session["code"] = generate_code()
        session["reset-pass-email"] = email
        
        db = backend(db_file_name="clothes_store.db")
        if not db.data_exists("Email", email):
            print("this is weird")
            # Send a 400 bad request error so that fetch treats it as !response.ok
            return jsonify({"error":"<p>*This email is not registered. Please check the spelling or <a href='login.html'>login here.</a></p>"}), 400
            
        sender_email = app.config.get('MAIL_USERNAME') or os.getenv('MAIL_USERNAME')
        
        msg = Message(
            subject="Password Reset Verification Code",
            sender=sender_email,
            recipients=[session["reset-pass-email"]],
            body=f"Your 6 digit verification code is {session['code']}"
        )
        msg.html = f"<p>Your 6 digit code is <b>{session['code']}</b></p>"
        
        with app.app_context():
            mail.send(msg)
            
        # 2. Return a JSON redirection string so JavaScript knows where to point the window
        return jsonify({"status": "success", "redirect": url_for("confirm_email")}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500   

def generate_code():
    code = str(100000 + secrets.randbelow(900000))
    return code

@app.route("/email-code", methods=["POST"])
def get_users_code():
    
    data = request.get_json()
    if str(data["code"]) == str(session['code']):
        return jsonify({"status": "success", "redirect":url_for("change_pass")}), 200
    return jsonify({"error": "<p>*invlaid code</p>"}), 500


@app.route("/new_pass", methods=["POST"])
def change_password():
    email = session["reset-pass-email"]
    new_pass = request.form.get("password")
    db = backend(db_file_name="clothes_store.db")
    if db.update_data("Password", generate_password_hash(new_pass), "Email", email):
        return redirect("/")
    return jsonify({"error": "<p>*Were experiencing errors right now pls try again or try agin later.</p>"}), 500

if __name__ == "__main__":
    app.run(debug=True)
