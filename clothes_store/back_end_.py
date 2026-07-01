import os
import sqlite3 as sql
import tkinter as tk
from tkinter import ttk 
from werkzeug.security import check_password_hash, generate_password_hash

class backend:
    def __init__(self, table_name="users", db_folder_name="db", db_file_name="db.db", **kwargs):
        """
        Universal Backend Class.
        Accepts any table name and dynamically stores any row data passed as keyword arguments.
        """
        self.__dir_path = os.path.dirname(os.path.abspath(__file__))
        
        # Ensure the database directory exists
        db_dir = os.path.join(self.__dir_path, db_folder_name)
        os.makedirs(db_dir, exist_ok=True)
        
        self.__db_path = os.path.join(db_dir, db_file_name)
        self.table_name = table_name 
        
        # Dynamically set any passed attributes (e.g., self.email, self.name, etc.)
        self.data_fields = kwargs
        for key, value in kwargs.items():
            setattr(self, f"_{key}", value)

    def add_to_db(self):
        """
        Dynamically inserts whatever data fields were passed during initialization into the table.
        """
        if not self.data_fields:
            #print("No data provided to insert.")
            return

        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()

        # Dynamically extract column names and create the placeholders
        columns = ", ".join(self.data_fields.keys())
        placeholders = ", ".join(["?"] * len(self.data_fields))
        values = tuple(self.data_fields.values())

        sql_code = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"
        
        try:
            cursor.execute(sql_code, values)
            conn.commit()
            #print(f"Data successfully inserted into {self.table_name}.")
        except sql.Error as e:
            print(f"Database error during insert: {e}")
        finally:
            cursor.close()
            conn.close()

    def clear_db(self):
        """
        Clears all data from the active table and resets sequences safely.
        """
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("PRAGMA foreign_keys = OFF;")
            cursor.execute(f"DELETE FROM {self.table_name};")
            #cursor.execute("DELETE FROM sqlite_sequence WHERE name = ?;", (self.table_name,))
            cursor.execute("PRAGMA foreign_keys = ON;")
            
            conn.commit()
            #print(f"Table '{self.table_name}' cleared successfully for debugging!")
        except sql.Error as e:
            conn.rollback()
            #print(f"An error occurred: {e}")
        finally:
            conn.close()

    def delete_user_from_db(self, column_name, value):
        """
        Universal deletion method. Deletes rows matching a specific column and value.
        """
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()

        # Safe parameterized deletion query
        sql_code = f"DELETE FROM {self.table_name} WHERE {column_name} = ? OR {column_name} IS NULL"

        try:
            cursor.execute(sql_code, (value,))
            conn.commit()
            #print(f"Successfully deleted {cursor.rowcount} rows from {self.table_name}.")
        except sql.Error as e:
            print(f"Error deleting data: {e}")
        finally:
            conn.close()


    def update_data(self, update_column, new_value, search_column, search_value):
        """
        Universal data updater. Updates a specific column's value where a condition is met.
        Example: update_data('Password', 'new_secure_hash', 'Email', 'user@example.com')
        """
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()

        # Safe parameterized update query
        sql_code = f"UPDATE {self.table_name} SET {update_column} = ? WHERE {search_column} = ?"

        try:
            cursor.execute(sql_code, (new_value, search_value))
            conn.commit()
            #print(f"Successfully updated {cursor.rowcount} row(s) in {self.table_name}.")
            return True
        except sql.Error as e:
            #print(f"Error updating data: {e}")
            return False
        finally:
            conn.close()


    def show_db(self):
        """
        Dynamically reads any SQLite table and populates a Tkinter Treeview window.
        """
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()

        try:
            # Get column names dynamically
            cursor.execute(f"PRAGMA table_info({self.table_name})")
            columns = [col[1] for col in cursor.fetchall()]

            # Get all rows
            cursor.execute(f"SELECT * FROM {self.table_name}")
            rows = cursor.fetchall()
        except sql.Error as e:
            #print(f"Error accessing table: {e}")
            conn.close()
            return
        finally:
            conn.close()

        # Initialize the Pop-up Window
        root = tk.Tk()
        root.title(f"Database Viewer - {self.table_name}")
        root.geometry("800x400")

        # Create a Treeview Widget (The Visual Table)
        table = ttk.Treeview(root, columns=columns, show="headings")

        # Define headings and column widths dynamically
        for col in columns:
            table.heading(col, text=col)
            table.column(col, width=120, anchor="center")

        # Insert rows into the visual table
        for row in rows:
            table.insert("", tk.END, values=row)

        # Add Scrollbars
        scrollbar = ttk.Scrollbar(root, orient="vertical", command=table.yview)
        table.configure(yscrollcommand=scrollbar.set)

        # Pack widgets into the window
        table.pack(fill="both", expand=True, side="left")
        scrollbar.pack(fill="y", side="right")

        # Keep the window open
        root.mainloop()

    def verify_user(self, email_column="Email", password_column="Password"):
        """
        Verifies user credentials if an email and password were provided at initialization.
        """
       
        email = self.data_fields.get(email_column)
        password = self.data_fields.get(password_column)

        if not email or not password:
            #print("Verification failed: Email or password was not provided during initialization.")
            return False

        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()
        
        query = f"SELECT {password_column} FROM {self.table_name} WHERE {email_column} = ?"
        cursor.execute(query, (email,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            stored_hash = user[0]
            # Compares the text password with your stored secure hash
            if check_password_hash(stored_hash, password):
                return True
                
        return False

    def get_data_(self, target_column, search_column, search_value):
        """
        Universal data retriever. Fetch any single value from any column.
        Example: get_data_('name', 'email', 'test@test.com') -> Returns the name
        """
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()

        # Fixed structural typo: 'FORM' corrected to 'FROM'
        sql_code = f"SELECT {target_column} FROM {self.table_name} WHERE {search_column} = ?"
        
        # Wrapped search_value in a single-element tuple safely
        cursor.execute(sql_code, (search_value,))

        result = cursor.fetchone()
        conn.close()

        # Returns the actual value, or None if not found
        return result[0] if result else None


    def create_table_safely(self, schema_definition):
        conn = sql.connect(self.__db_path)
        cursor = conn.cursor()
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {self.table_name} ({schema_definition});")
        conn.commit()
        conn.close()
        #rint(f"Table '{self.table_name}' verified/created safely.")