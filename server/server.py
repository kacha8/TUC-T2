#IMPORTS
from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, jsonify, make_response, Response, current_app
import json, datetime, os
from functools import wraps

# MAKING THE APP
app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(os.path.dirname(os.path.realpath(__file__)), "database.db"),
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='password'
))
app.config.from_envvar('SERVER_SETTINGS', silent=True)


def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv


def init_db():
		"""Initializes the database."""
		with app.app_context():
			db = get_db()
			with app.open_resource('schema.sql', mode='r') as f:
				db.cursor().executescript(f.read())
			db.commit()

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

def query_db(query, args=(), one=False):
    """queries database for a single result"""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

#APP FUNCTIONS
#EDIT BELOW HERE

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/developerOptions.html')
def dev():
    return render_template('developerOptions.html')

@app.route('/clientApp.html')
def cli():
    return render_template('clientApp.html')

@app.route('/index.html')
def ind():
    return render_template('index.html')

@app.route('/mappingApp.html')
def map():
    return render_template('mappingApp.html')

@app.route('/navigationApp.html')
def nav():
    return render_template('navigationApp.html')

@app.route('/_bounds_update', methods=['GET'])
def boundsUpdate():
    if request.method == 'GET':
        latlngs = request.args.get('latlngs',0)
        print latlngs
        init_db()
        db = get_db()
        db.execute('insert into entries (title, text) values (?, ?)',
                   ['bounds', latlngs])
        db.commit()
        return jsonify(data='success')
        
        
@app.route('/_bounds', methods=['GET'])
def bounds():
    db = get_db()
    path = query_db('select * from entries where title = ?',['bounds'], one=True)
    return jsonify(path['text'])


if __name__ == '__main__':
    # init_db()
    # Uncommenting the above line will make the server reinitialise the db each time it's run,
    # removing any previous records, leave commented for a persistent DB
    
    app.run(host='0.0.0.0', port=80, debug=True)  # Make server publicly available on port 80
    #app.run() # Make the server only available locally on port 5000 (127.0.0.1:5000)
