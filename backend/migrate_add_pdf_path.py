"""
Migration: Add adapted_pdf_path column to AdaptedMaterial table
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(adapted_materials)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'adapted_pdf_path' not in columns:
            print("Adding adapted_pdf_path column...")
            cursor.execute("""
                ALTER TABLE adapted_materials 
                ADD COLUMN adapted_pdf_path TEXT
            """)
            conn.commit()
            print("✅ Migration completed successfully!")
        else:
            print("✅ Column adapted_pdf_path already exists. No migration needed.")
    
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
