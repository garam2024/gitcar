import psycopg2

try:
  conn = psycopg2.connect("dbname='mydb' user='temp' host='192.168.0.100' password='pwtemp'")
except:
  print("not connect")

cur = conn.cursor()
try:
  sqlString = "INSERT INTO ptest (gid, description, size) VALUES (%s, %s, %s);"
  cur.execute(sqlString, (1, 'd_string', '{123, 456, 789}',) )
except:
  print("cannot SQL Execute")

conn.commit()
cur.close()
conn.close()