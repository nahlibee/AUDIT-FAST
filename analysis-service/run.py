import uvicorn
import os
import sys

# Add the parent directory to the Python path to make imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
    
    print("SAP Analyzer API started at http://localhost:8000")
    print("API documentation available at http://localhost:8000/docs") 