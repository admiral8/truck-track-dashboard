import psycopg2

def get_connection():
	return psycopg2.connect(
		dbname="truck_dashboard",
		user="81suntory",
		host="localhost",
		port="5432"
	)